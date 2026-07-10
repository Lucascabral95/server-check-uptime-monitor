import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Pool, Client } from 'undici';
import { lookup } from 'dns/promises';
import { request as httpRequest } from 'http';
import { request as httpsRequest } from 'https';
import { assertSafeMonitorUrl } from 'src/common/security/ssrf-guard';

// ============================================================================
// INTERFACES
// ============================================================================

interface HttpPoolStats {
  activeRequests: number;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  timeoutRequests: number;
  circuitBreakerOpen: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface CheckResult {
  success: boolean;
  statusCode: number;
  durationMs: number;
  error?: string;
  retries?: number;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failures: number;
  lastFailureTime: number;
  nextRetryTime: number;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const CONFIG = {
  // Pool settings
  POOL_CONNECTIONS: 100,
  POOL_PIPELINING: 10,
  KEEP_ALIVE_TIMEOUT: 60000,
  CONNECT_TIMEOUT: 5000,

  // Retry settings
  MAX_RETRIES: 3,
  RETRY_BASE_DELAY: 1000,
  RETRY_MAX_DELAY: 10000,

  // Circuit breaker settings
  CIRCUIT_BREAKER_THRESHOLD: 5,
  CIRCUIT_BREAKER_TIMEOUT: 30000,
  CIRCUIT_BREAKER_RESET_TIMEOUT: 60000,

  // Stats settings
  STATS_WINDOW_SIZE: 10000,
  STATS_LOG_INTERVAL: 60000,
} as const;

// ============================================================================
// HTTP POOL SERVICE - PRODUCTION READY
// ============================================================================

@Injectable()
export class HttpPoolService implements OnModuleInit {
  private readonly logger = new Logger(HttpPoolService.name);

  // Connection pools por dominio
  private pools = new Map<string, Pool>();
  private fallbackClient: Client;

  // Circuit breakers por URL
  private circuitBreakers = new Map<string, CircuitBreakerState>();

  // Stats
  private stats: HttpPoolStats = {
    activeRequests: 0,
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    timeoutRequests: 0,
    circuitBreakerOpen: 0,
    averageResponseTime: 0,
    p95ResponseTime: 0,
    p99ResponseTime: 0,
  };

  private responseTimes: number[] = [];
  private responseTimesDirty = false;
  private statsInterval: NodeJS.Timeout | null = null;

  // ========================================================================
  // LIFECYCLE HOOKS
  // ========================================================================

  async onModuleInit() {
    // Cliente fallback para URLs únicas
    this.fallbackClient = new Client('https://fallback.local', {
      connect: { timeout: CONFIG.CONNECT_TIMEOUT },
      keepAliveTimeout: CONFIG.KEEP_ALIVE_TIMEOUT,
    });

    this.startStatsInterval();
    this.logger.log('HttpPoolService initialized with undici pools');
  }

  // Se llama explícitamente desde GracefulShutdownService (no es un hook de
  // ciclo de vida de Nest): si fuera onModuleDestroy, correría en la fase 1
  // del shutdown, ANTES de que el worker de BullMQ termine de drenar sus
  // jobs activos (fase 2) — cerrando estos pools mientras un check HTTP
  // todavía está en vuelo.
  async closeAll() {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    // Cerrar todos los pools
    for (const [domain, pool] of this.pools) {
      await pool.close();
      this.logger.debug(`Pool closed: ${domain}`);
    }

    await this.fallbackClient.close();
    this.logFinalStats();
    this.logger.log('HttpPoolService destroyed');
  }

  // ========================================================================
  // MÉTODO PRINCIPAL - CHECK URL
  // ========================================================================

  async checkUrl(
    url: string,
    timeoutMs = 10000,
    options: HttpCheckOptions = {},
  ): Promise<CheckResult> {
    const startTime = Date.now();
    let retries = 0;

    // Revalidar SSRF en cada check, no solo al crear el monitor: el DNS
    // del hostname puede haber cambiado desde la creación (DNS rebinding)
    // para apuntar a una IP privada/metadata en el momento del check.
    try {
      await assertSafeMonitorUrl(url);
    } catch (error) {
      return {
        success: false,
        statusCode: 0,
        durationMs: Date.now() - startTime,
        error: `URL bloqueada por política de seguridad: ${error.message}`,
      };
    }

    // Verificar circuit breaker
    if (this.isCircuitBreakerOpen(url)) {
      this.stats.circuitBreakerOpen++;
      return {
        success: false,
        statusCode: 0,
        durationMs: 0,
        error: 'Circuit breaker is OPEN',
      };
    }

    this.stats.activeRequests++;

    try {
      // Intentar con retries exponenciales
      const address = await lookup(new URL(url).hostname, { all: false });
      const result = await this.executeWithRetry(url, timeoutMs, CONFIG.MAX_RETRIES, {
        ...options,
        resolvedAddress: address.address,
      });

      retries = result.retries || 0;
      const durationMs = Date.now() - startTime;

      if (result.success) {
        this.recordSuccess(url, durationMs);
      } else {
        this.recordFailure(url, durationMs, result.error || 'Unknown error');
      }

      return { ...result, durationMs, retries };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      this.recordFailure(url, durationMs, error.message);

      return {
        success: false,
        statusCode: 0,
        durationMs,
        error: error.message || 'Unknown error',
        retries,
      };
    } finally {
      this.stats.activeRequests--;
    }
  }

  // ========================================================================
  // RETRY LOGIC CON EXPONENTIAL BACKOFF
  // ========================================================================

  private async executeWithRetry(
    url: string,
    timeoutMs: number,
    maxRetries: number,
    options: HttpCheckOptions,
  ): Promise<Omit<CheckResult, 'durationMs'>> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Delay exponencial entre reintentos
        if (attempt > 0) {
          const delay = Math.min(
            CONFIG.RETRY_BASE_DELAY * Math.pow(2, attempt - 1),
            CONFIG.RETRY_MAX_DELAY,
          );
          await this.sleep(delay);
          this.logger.debug(`Retry ${attempt}/${maxRetries} for ${url}`);
        }

        const result = await this.executeRequest(url, timeoutMs, options);
        return { ...result, retries: attempt };
      } catch (error) {
        lastError = error;

        // Si es timeout o error de red, reintentar
        if (this.isRetryableError(error)) {
          continue;
        }

        // Error no recuperable, no reintentar
        break;
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  // ========================================================================
  // EJECUCIÓN DE REQUEST CON POOL
  // ========================================================================

  private async executeRequest(
    url: string,
    timeoutMs: number,
    options: HttpCheckOptions,
  ): Promise<Omit<CheckResult, 'durationMs'>> {
    const parsedUrl = new URL(url);
    if (options.resolvedAddress) {
      return this.executePinnedRequest(parsedUrl, timeoutMs, options);
    }
    const pool = this.getOrCreatePool(parsedUrl.origin);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await pool.request({
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method ?? 'GET',
        headers: {
          'User-Agent': 'Server-Check-App/2.0',
          Accept: '*/*',
          ...options.headers,
        },
        body: options.body,
        signal: controller.signal,
      });

      // Consumir body para liberar conexión
      const body = await response.body.text();
      if (options.maxResponseBytes && Buffer.byteLength(body, 'utf8') > options.maxResponseBytes) {
        return {
          success: false,
          statusCode: response.statusCode,
          error: 'Response exceeds configured size limit',
        };
      }
      const statusMatches = options.expectedStatusCodes?.length
        ? options.expectedStatusCodes.includes(response.statusCode)
        : response.statusCode >= 200 && response.statusCode < 300;
      const textMatches = !options.expectedText || body.includes(options.expectedText);
      let jsonMatches = true;
      if (options.expectedJsonPath) {
        try {
          const payload = JSON.parse(body) as Record<string, unknown>;
          const actual = options.expectedJsonPath.split('.').reduce<unknown>((value, key) => {
            return value && typeof value === 'object'
              ? (value as Record<string, unknown>)[key]
              : undefined;
          }, payload);
          jsonMatches =
            options.expectedJsonValue === undefined
              ? actual !== undefined
              : JSON.stringify(actual) === JSON.stringify(options.expectedJsonValue);
        } catch {
          jsonMatches = false;
        }
      }

      return {
        success: statusMatches && textMatches && jsonMatches,
        statusCode: response.statusCode,
        error: !statusMatches
          ? `Unexpected status code: ${response.statusCode}`
          : !textMatches
            ? 'Expected text was not found'
            : !jsonMatches
              ? 'Expected JSON assertion failed'
              : undefined,
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        this.stats.timeoutRequests++;
        throw new Error('Request timeout');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private executePinnedRequest(
    parsedUrl: URL,
    timeoutMs: number,
    options: HttpCheckOptions,
  ): Promise<Omit<CheckResult, 'durationMs'>> {
    return new Promise((resolve, reject) => {
      const transport = parsedUrl.protocol === 'https:' ? httpsRequest : httpRequest;
      const request = transport(
        {
          hostname: options.resolvedAddress,
          port: parsedUrl.port
            ? Number(parsedUrl.port)
            : parsedUrl.protocol === 'https:'
              ? 443
              : 80,
          path: parsedUrl.pathname + parsedUrl.search,
          method: options.method ?? 'GET',
          headers: {
            'User-Agent': 'Server-Check-App/2.0',
            Accept: '*/*',
            Host: parsedUrl.host,
            ...options.headers,
          },
          servername: parsedUrl.hostname,
          timeout: timeoutMs,
        },
        response => {
          const chunks: Buffer[] = [];
          let size = 0;
          response.on('data', chunk => {
            size += chunk.length;
            if (!options.maxResponseBytes || size <= options.maxResponseBytes) chunks.push(chunk);
          });
          response.on('end', () => {
            if (options.maxResponseBytes && size > options.maxResponseBytes)
              return resolve({
                success: false,
                statusCode: response.statusCode ?? 0,
                error: 'Response exceeds configured size limit',
              });
            const body = Buffer.concat(chunks).toString('utf8');
            const statusMatches = options.expectedStatusCodes?.length
              ? options.expectedStatusCodes.includes(response.statusCode ?? 0)
              : (response.statusCode ?? 0) >= 200 && (response.statusCode ?? 0) < 300;
            const textMatches = !options.expectedText || body.includes(options.expectedText);
            let jsonMatches = true;
            if (options.expectedJsonPath) {
              try {
                const payload = JSON.parse(body) as Record<string, unknown>;
                const actual = options.expectedJsonPath
                  .split('.')
                  .reduce<unknown>(
                    (value, key) =>
                      value && typeof value === 'object'
                        ? (value as Record<string, unknown>)[key]
                        : undefined,
                    payload,
                  );
                jsonMatches =
                  options.expectedJsonValue === undefined
                    ? actual !== undefined
                    : JSON.stringify(actual) === JSON.stringify(options.expectedJsonValue);
              } catch {
                jsonMatches = false;
              }
            }
            resolve({
              success: statusMatches && textMatches && jsonMatches,
              statusCode: response.statusCode ?? 0,
              error: !statusMatches
                ? `Unexpected status code: ${response.statusCode}`
                : !textMatches
                  ? 'Expected text was not found'
                  : !jsonMatches
                    ? 'Expected JSON assertion failed'
                    : undefined,
            });
          });
        },
      );
      request.on('timeout', () => request.destroy(new Error('Request timeout')));
      request.on('error', reject);
      if (options.body) request.write(options.body);
      request.end();
    });
  }

  private getOrCreatePool(origin: string): Pool {
    let pool = this.pools.get(origin);

    if (!pool) {
      pool = new Pool(origin, {
        connections: CONFIG.POOL_CONNECTIONS,
        pipelining: CONFIG.POOL_PIPELINING,
        keepAliveTimeout: CONFIG.KEEP_ALIVE_TIMEOUT,
        connect: {
          timeout: CONFIG.CONNECT_TIMEOUT,
        },
      });

      this.pools.set(origin, pool);
      this.logger.debug(`Pool created for: ${origin}`);
    }

    return pool;
  }

  private isCircuitBreakerOpen(url: string): boolean {
    const breaker = this.circuitBreakers.get(url);
    if (!breaker) return false;

    const now = Date.now();

    if (breaker.isOpen) {
      if (now >= breaker.nextRetryTime) {
        this.logger.log(`Circuit breaker half-open for ${url}`);
        breaker.isOpen = false;
        breaker.failures = 0;
        return false;
      }
      return true;
    }

    return false;
  }

  private recordCircuitBreakerFailure(url: string): void {
    let breaker = this.circuitBreakers.get(url);

    if (!breaker) {
      breaker = {
        isOpen: false,
        failures: 0,
        lastFailureTime: 0,
        nextRetryTime: 0,
      };
      this.circuitBreakers.set(url, breaker);
    }

    const now = Date.now();
    breaker.failures++;
    breaker.lastFailureTime = now;

    if (breaker.failures >= CONFIG.CIRCUIT_BREAKER_THRESHOLD) {
      breaker.isOpen = true;
      breaker.nextRetryTime = now + CONFIG.CIRCUIT_BREAKER_RESET_TIMEOUT;

      this.logger.warn(`Circuit breaker OPEN for ${url} (${breaker.failures} failures)`);
    }
  }

  private resetCircuitBreaker(url: string): void {
    const breaker = this.circuitBreakers.get(url);
    if (breaker) {
      breaker.failures = 0;
      breaker.isOpen = false;
    }
  }

  private recordSuccess(url: string, durationMs: number): void {
    this.stats.totalRequests++;
    this.stats.successfulRequests++;
    this.updateResponseTimes(durationMs);
    this.resetCircuitBreaker(url);
  }

  private recordFailure(url: string, durationMs: number, error: string): void {
    this.stats.totalRequests++;
    this.stats.failedRequests++;
    this.updateResponseTimes(durationMs);
    this.recordCircuitBreakerFailure(url);

    this.logger.debug(`HTTP request failed: ${error} (${durationMs}ms)`);
  }

  // Ordenar hasta 10.000 elementos en cada check (potencialmente decenas por
  // segundo entre todos los monitores) es el costo real, no el cálculo del
  // percentil en sí. Por eso acá solo se empuja el valor y se marca "dirty";
  // el sort amortizado ocurre en refreshResponseTimeStatsIfDirty(), que
  // getStats()/logStats() invocan bajo demanda, muchísimo menos seguido que
  // los checks que lo ensucian.
  private updateResponseTimes(durationMs: number): void {
    this.responseTimes.push(durationMs);

    if (this.responseTimes.length > CONFIG.STATS_WINDOW_SIZE) {
      this.responseTimes.shift();
    }

    this.responseTimesDirty = true;
  }

  private refreshResponseTimeStatsIfDirty(): void {
    if (!this.responseTimesDirty) return;

    const sorted = [...this.responseTimes].sort((a, b) => a - b);
    const sum = sorted.reduce((a, b) => a + b, 0);

    this.stats.averageResponseTime = sum / sorted.length;
    this.stats.p95ResponseTime = this.percentile(sorted, 95);
    this.stats.p99ResponseTime = this.percentile(sorted, 99);

    this.responseTimesDirty = false;
  }

  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private isRetryableError(error: any): boolean {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'EAI_AGAIN' ||
      error.name === 'AbortError'
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private startStatsInterval(): void {
    this.statsInterval = setInterval(() => {
      this.logStats();
    }, CONFIG.STATS_LOG_INTERVAL);
  }

  private logStats(): void {
    if (this.stats.totalRequests === 0) return;

    this.refreshResponseTimeStatsIfDirty();

    const successRate = (this.stats.successfulRequests / this.stats.totalRequests) * 100;

    this.logger.log({
      message: 'HTTP Pool Stats',
      active: this.stats.activeRequests,
      total: this.stats.totalRequests,
      success: this.stats.successfulRequests,
      failed: this.stats.failedRequests,
      timeouts: this.stats.timeoutRequests,
      circuitBreakers: this.stats.circuitBreakerOpen,
      successRate: `${successRate.toFixed(2)}%`,
      avgResponseTime: `${this.stats.averageResponseTime.toFixed(2)}ms`,
      p95: `${this.stats.p95ResponseTime.toFixed(2)}ms`,
      p99: `${this.stats.p99ResponseTime.toFixed(2)}ms`,
      pools: this.pools.size,
    });
  }

  private logFinalStats(): void {
    this.logger.log('=== Final HTTP Pool Statistics ===');
    this.logStats();
  }

  getStats(): HttpPoolStats {
    this.refreshResponseTimeStatsIfDirty();
    return { ...this.stats };
  }

  resetStats(): void {
    this.stats = {
      activeRequests: 0,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      timeoutRequests: 0,
      circuitBreakerOpen: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
    };
    this.responseTimes = [];
    this.responseTimesDirty = false;
    this.circuitBreakers.clear();
  }

  getPoolInfo(): { domain: string; active: boolean }[] {
    return Array.from(this.pools.keys()).map(domain => ({
      domain,
      active: true,
    }));
  }

  async healthCheck(): Promise<boolean> {
    return this.stats.activeRequests < 1000 && this.pools.size < 100;
  }
}

export interface HttpCheckOptions {
  method?: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  expectedStatusCodes?: number[];
  expectedText?: string;
  expectedJsonPath?: string;
  expectedJsonValue?: unknown;
  maxResponseBytes?: number;
  followRedirects?: boolean;
  resolvedAddress?: string;
}
