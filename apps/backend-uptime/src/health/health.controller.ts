import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, HealthIndicatorService } from '@nestjs/terminus';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpPoolService } from 'src/uptime/services/http-pool.service';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { HealthRedisClient } from './health-redis.client';

/**
 * Rutas fuera del prefijo /api/v1 (ver config/routes-excludes-prefix.ts).
 *
 * - /health/liveness: el proceso puede responder. NO depende de Postgres ni
 *   Redis — si dependiera, un blip de la DB reiniciaría el pod en un loop.
 * - /health/readiness: además de liveness, exige Postgres y Redis alcanzables,
 *   y que el pool HTTP / buffer de logs estén en rango sano.
 *   @nestjs/terminus además devuelve 'shutting_down' (503) automáticamente
 *   apenas arranca el shutdown de Nest (enableShutdownHooks), sin que este
 *   controller tenga que trackear ese estado por su cuenta.
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly prisma: PrismaService,
    private readonly httpPoolService: HttpPoolService,
    private readonly pingLogBufferService: PingLogBufferService,
    private readonly redisClient: HealthRedisClient,
  ) {}

  @Get('liveness')
  @HealthCheck()
  liveness() {
    return this.health.check([() => this.healthIndicatorService.check('process').up()]);
  }

  @Get('readiness')
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.checkDatabase(),
      () => this.checkRedis(),
      () => this.checkHttpPool(),
      () => this.checkPingLogBuffer(),
    ]);
  }

  private async checkDatabase() {
    const indicator = this.healthIndicatorService.check('database');
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return indicator.up({ ...this.prisma.getPoolStats() });
    } catch (error) {
      return indicator.down(error.message);
    }
  }

  private async checkRedis() {
    const indicator = this.healthIndicatorService.check('redis');
    try {
      await this.redisClient.client.ping();
      return indicator.up();
    } catch (error) {
      return indicator.down(error.message);
    }
  }

  private async checkHttpPool() {
    const indicator = this.healthIndicatorService.check('httpPool');
    const isHealthy = await this.httpPoolService.healthCheck();
    const stats = { ...this.httpPoolService.getStats() };
    return isHealthy ? indicator.up(stats) : indicator.down(stats);
  }

  private async checkPingLogBuffer() {
    const indicator = this.healthIndicatorService.check('pingLogBuffer');
    const isHealthy = await this.pingLogBufferService.healthCheck();
    const stats = { ...this.pingLogBufferService.getStats() };
    return isHealthy ? indicator.up(stats) : indicator.down(stats);
  }
}
