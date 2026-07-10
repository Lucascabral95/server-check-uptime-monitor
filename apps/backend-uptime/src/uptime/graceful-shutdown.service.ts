import { Injectable, Logger, BeforeApplicationShutdown } from '@nestjs/common';
import { UptimeProcessor } from './uptime.processor';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { HttpPoolService } from './services/http-pool.service';
import { envs } from 'src/config/envs.schema';

/**
 * Orquesta el shutdown en un único lugar en vez de dejarlo repartido en
 * varios `onModuleDestroy` independientes: Nest NO garantiza el orden de
 * `onModuleDestroy` entre módulos distintos, pero SÍ garantiza que todos los
 * `beforeApplicationShutdown` terminan antes de que empiece cualquier
 * `onApplicationShutdown`. Este servicio vive en esa fase (`beforeApplication
 * Shutdown`); PrismaService.onApplicationShutdown (fase siguiente) es lo
 * único que se apoya en esa garantía de fase, no en orden entre servicios.
 *
 * Orden real y por qué:
 *   1. Esperar un poco: @nestjs/terminus ya marca /health/readiness como
 *      "shutting_down" (503) apenas arranca esta misma fase de shutdown
 *      (HealthCheckExecutor también implementa beforeApplicationShutdown),
 *      así que este delay le da tiempo al balanceador a dejar de mandar
 *      tráfico nuevo antes de que empecemos a cerrar recursos.
 *   2. Cerrar el worker de BullMQ (dejar de tomar jobs + esperar los activos).
 *      Debe ir antes que todo lo demás: mientras un job siga corriendo puede
 *      seguir pegándole a HttpPoolService y al buffer.
 *   3. Cerrar los pools de undici — ya no hay ningún job usándolos.
 *   4. Flush final del buffer de PingLog — Postgres todavía está vivo
 *      (Prisma se desconecta recién en la fase onApplicationShutdown) y ya
 *      no van a llegar más `add()` porque el worker está cerrado.
 */
@Injectable()
export class GracefulShutdownService implements BeforeApplicationShutdown {
  private readonly logger = new Logger(GracefulShutdownService.name);

  constructor(
    private readonly uptimeProcessor: UptimeProcessor,
    private readonly pingLogBufferService: PingLogBufferService,
    private readonly httpPoolService: HttpPoolService,
  ) {}

  async beforeApplicationShutdown(signal?: string) {
    this.logger.log(`Graceful shutdown starting (signal: ${signal ?? 'n/a'})`);

    await this.sleep(envs.shutdown_drain_delay_ms);

    try {
      await this.uptimeProcessor.worker.close();
      this.logger.log('BullMQ worker closed (in-flight jobs drained)');
    } catch (error) {
      this.logger.error(`Error closing BullMQ worker: ${error.message}`, error.stack);
    }

    try {
      await this.httpPoolService.closeAll();
    } catch (error) {
      this.logger.error(`Error closing HTTP pools: ${error.message}`, error.stack);
    }

    try {
      await this.pingLogBufferService.flushFinal();
    } catch (error) {
      this.logger.error(`Error flushing ping log buffer: ${error.message}`, error.stack);
    }

    this.logger.log('Graceful shutdown sequence completed');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
