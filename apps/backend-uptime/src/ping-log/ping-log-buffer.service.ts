import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// ============================================================================
// INTERFACES
// ============================================================================

interface PingLogBuffer {
    monitorId: string;
    statusCode: number;
    durationMs: number;
    success: boolean;
    error?: string;
    timestamp?: Date;
}

interface BufferStats {
    currentSize: number;
    totalAdded: number;
    totalFlushed: number;
    totalFailed: number;
    flushCount: number;
    lastFlushTime: Date | null;
    lastFlushDuration: number;
    isFlushingNow: boolean;
    droppedDueToBackpressure: number;
}

const CONFIG = {
    BUFFER_SIZE: 500,
    MAX_BUFFER_SIZE: 2000,
    FLUSH_INTERVAL_MS: 5000,

    MAX_FLUSH_RETRIES: 3,
    RETRY_DELAY_MS: 1000,

    STATS_LOG_INTERVAL: 60000,
} as const;

@Injectable()
export class PingLogBufferService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PingLogBufferService.name);

    private buffer: PingLogBuffer[] = [];
    private isFlushingLock = false;

    private retryBuffer: PingLogBuffer[] = [];

    private flushInterval: NodeJS.Timeout | null = null;
    private statsInterval: NodeJS.Timeout | null = null;

    // Stats
    private stats: BufferStats = {
        currentSize: 0,
        totalAdded: 0,
        totalFlushed: 0,
        totalFailed: 0,
        flushCount: 0,
        lastFlushTime: null,
        lastFlushDuration: 0,
        isFlushingNow: false,
        droppedDueToBackpressure: 0,
    };

    constructor(private readonly prisma: PrismaService) {}

    async onModuleInit() {
        this.startFlushInterval();
        this.startStatsInterval();

        this.logger.log(
            `PingLogBuffer initialized: size=${CONFIG.BUFFER_SIZE}, ` +
            `maxSize=${CONFIG.MAX_BUFFER_SIZE}, interval=${CONFIG.FLUSH_INTERVAL_MS}ms`,
        );
    }

    async onModuleDestroy() {
        // Detener timers
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }

        if (this.statsInterval) {
            clearInterval(this.statsInterval);
            this.statsInterval = null;
        }

        // Flush final (sin timeout)
        await this.flushFinal();

        this.logger.log('PingLogBufferService destroyed');
    }

    add(log: PingLogBuffer): boolean {
        // Validación básica
        if (!log.monitorId) {
            this.logger.warn('Attempted to add log without monitorId');
            return false;
        }

        // Backpressure: si el buffer está muy lleno, rechazar
        const totalBufferSize = this.buffer.length + this.retryBuffer.length;
        if (totalBufferSize >= CONFIG.MAX_BUFFER_SIZE) {
            this.stats.droppedDueToBackpressure++;
            this.logger.warn(
                `Buffer full (${totalBufferSize}/${CONFIG.MAX_BUFFER_SIZE}), dropping log`,
            );
            return false;
        }

        // Agregar al buffer principal
        this.buffer.push({
            ...log,
            timestamp: log.timestamp || new Date(),
        });

        this.stats.totalAdded++;
        this.stats.currentSize = this.buffer.length;

        // Auto-flush si alcanza el tamaño óptimo
        if (this.buffer.length >= CONFIG.BUFFER_SIZE) {
            this.flush().catch((error) => {
                this.logger.error(`Auto-flush failed: ${error.message}`);
            });
        }

        return true;
    }

    async flush(): Promise<void> {
        if (this.isFlushingLock) {
            this.logger.debug('Flush already in progress, skipping');
            return;
        }

        if (this.buffer.length === 0 && this.retryBuffer.length === 0) {
            return;
        }

        this.isFlushingLock = true;
        this.stats.isFlushingNow = true;
        const startTime = Date.now();

        try {
            // 1. Flushear buffer principal
            if (this.buffer.length > 0) {
                await this.flushMainBuffer();
            }

            // 2. Flushear retry buffer
            if (this.retryBuffer.length > 0) {
                await this.flushRetryBuffer();
            }

            // Actualizar stats
            this.stats.flushCount++;
            this.stats.lastFlushTime = new Date();
            this.stats.lastFlushDuration = Date.now() - startTime;

            this.logger.debug(
                `Flush completed in ${this.stats.lastFlushDuration}ms`,
            );
        } catch (error) {
            this.logger.error(`Flush failed: ${error.message}`, error.stack);
            throw error;
        } finally {
            this.isFlushingLock = false;
            this.stats.isFlushingNow = false;
            this.stats.currentSize = this.buffer.length;
        }
    }

    private async flushMainBuffer(): Promise<void> {
        const logsToFlush = this.buffer.splice(0, this.buffer.length);

        if (logsToFlush.length === 0) return;

        this.logger.debug(`Flushing ${logsToFlush.length} logs from main buffer`);

        try {
            await this.writeToDatabase(logsToFlush);
            this.stats.totalFlushed += logsToFlush.length;
        } catch (error) {
            this.logger.error(`Main buffer flush failed: ${error.message}`);

            this.retryBuffer.push(...logsToFlush);
            this.stats.totalFailed += logsToFlush.length;

            throw error;
        }
    }

    private async flushRetryBuffer(): Promise<void> {
        const logsToRetry = this.retryBuffer.splice(0, this.retryBuffer.length);

        if (logsToRetry.length === 0) return;

        this.logger.debug(
            `Retrying ${logsToRetry.length} logs from retry buffer`,
        );

        try {
            await this.writeToDatabase(logsToRetry);
            this.stats.totalFlushed += logsToRetry.length;
            this.logger.log(`Successfully flushed ${logsToRetry.length} retry logs`);
        } catch (error) {
            this.logger.error(`Retry buffer flush failed: ${error.message}`);

            const maxRetryAge = 5 * 60 * 1000; // 5 minutos
            const now = Date.now();

            const validLogs = logsToRetry.filter((log) => {
                const age = now - (log.timestamp?.getTime() || now);
                return age < maxRetryAge;
            });

            this.retryBuffer.push(...validLogs);

            const discarded = logsToRetry.length - validLogs.length;
            if (discarded > 0) {
                this.logger.warn(`Discarded ${discarded} old retry logs`);
            }

            throw error;
        }
    }

    private async writeToDatabase(logs: PingLogBuffer[]): Promise<void> {
        if (logs.length === 0) return;

        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= CONFIG.MAX_FLUSH_RETRIES; attempt++) {
            try {
                await this.prisma.pingLog.createMany({
                    data: logs,
                    skipDuplicates: true,
                });

                return; // Éxito
            } catch (error) {
                lastError = error;

                this.logger.warn(
                    `Database write attempt ${attempt}/${CONFIG.MAX_FLUSH_RETRIES} failed: ${error.message}`,
                );

                // Esperar antes de reintentar
                if (attempt < CONFIG.MAX_FLUSH_RETRIES) {
                    await this.sleep(CONFIG.RETRY_DELAY_MS * attempt);
                }
            }
        }

        // Si llegamos aquí, todos los intentos fallaron
        throw lastError || new Error('Database write failed after all retries');
    }

    private async flushFinal(): Promise<void> {
        this.logger.log('Performing final flush before shutdown...');

        const totalLogs = this.buffer.length + this.retryBuffer.length;
        if (totalLogs === 0) {
            this.logger.log('No logs to flush on shutdown');
            return;
        }

        try {
            await this.flush();

            this.logger.log(`Final flush completed: ${totalLogs} logs written`);
        } catch (error) {
            this.logger.error(
                `Final flush failed, ${totalLogs} logs may be lost: ${error.message}`,
            );

            this.logLostLogs();
        }
    }

    private logLostLogs(): void {
        const allLogs = [...this.buffer, ...this.retryBuffer];

        if (allLogs.length > 0) {
            this.logger.error(
                `CRITICAL: Lost ${allLogs.length} logs on shutdown. ` +
                `First 5: ${JSON.stringify(allLogs.slice(0, 5))}`,
            );
        }
    }

    private startFlushInterval(): void {
        this.flushInterval = setInterval(() => {
            this.flush().catch((error) => {
                this.logger.error(`Periodic flush failed: ${error.message}`);
            });
        }, CONFIG.FLUSH_INTERVAL_MS);
    }

    private startStatsInterval(): void {
        this.statsInterval = setInterval(() => {
            this.logStats();
        }, CONFIG.STATS_LOG_INTERVAL);
    }

    private logStats(): void {
        const totalBufferSize = this.buffer.length + this.retryBuffer.length;

        this.logger.log({
            message: 'PingLog Buffer Stats',
            bufferSize: this.buffer.length,
            retryBufferSize: this.retryBuffer.length,
            totalSize: totalBufferSize,
            totalAdded: this.stats.totalAdded,
            totalFlushed: this.stats.totalFlushed,
            totalFailed: this.stats.totalFailed,
            flushCount: this.stats.flushCount,
            droppedDueToBackpressure: this.stats.droppedDueToBackpressure,
            lastFlushDuration: `${this.stats.lastFlushDuration}ms`,
            isFlushingNow: this.stats.isFlushingNow,
        });
    }

    getStats(): BufferStats {
        return {
            ...this.stats,
            currentSize: this.buffer.length,
        };
    }

    resetStats(): void {
        this.stats = {
            currentSize: this.buffer.length,
            totalAdded: 0,
            totalFlushed: 0,
            totalFailed: 0,
            flushCount: 0,
            lastFlushTime: null,
            lastFlushDuration: 0,
            isFlushingNow: false,
            droppedDueToBackpressure: 0,
        };
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async healthCheck(): Promise<boolean> {
        const totalSize = this.buffer.length + this.retryBuffer.length;
        const isHealthy =
            totalSize < CONFIG.MAX_BUFFER_SIZE * 0.8 &&
            !this.isFlushingLock;

        if (!isHealthy) {
            this.logger.warn(
                `Health check failed: buffer=${totalSize}, locked=${this.isFlushingLock}`,
            );
        }

        return isHealthy;
    }

    async forceFlush(): Promise<void> {
        this.logger.log('Force flush requested');
        await this.flush();
    }

    getBufferUtilization(): number {
        const totalSize = this.buffer.length + this.retryBuffer.length;
        return (totalSize / CONFIG.MAX_BUFFER_SIZE) * 100;
    }
}