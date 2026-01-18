import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { PingLogService } from 'src/ping-log/ping-log.service';

interface CheckResult {
    success: boolean;
    statusCode: number;
    durationMs: number;
    error?: string;
}

@Processor(QUEUES_NAME.UPTIME_MONITOR)
export class UptimeProcessor extends WorkerHost {
    private readonly logger = new Logger(UptimeProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly pingLogService: PingLogService
    ) {
        super();
    }

    async process(job: Job) {
        this.logger.log(`Starting monitor scan job: ${job.id}`);

        try {
            // 1. Buscar monitors que necesitan check (isActive=true Y nextCheck <= ahora)
            const pendingMonitors = await this.prisma.monitor.findMany({
                where: {
                    isActive: true,
                    nextCheck: {
                        lte: new Date(),
                    },
                },
                select: {
                    id: true,
                    url: true,
                    frequency: true,
                    name: true,
                },
            });

            if (pendingMonitors.length === 0) {
                this.logger.log('No pending monitors to check');
                return;
            }

            this.logger.log(`Found ${pendingMonitors.length} monitors to check`);

            // 2. Procesar cada monitor
            for (const monitor of pendingMonitors) {
                await this.processMonitor(monitor);
            }

            this.logger.log(`Completed processing ${pendingMonitors.length} monitors`);
        } catch (error) {
            this.logger.error(`Error processing monitor scan: ${error.message}`, error.stack);
            throw error;
        }
    }

    // Procesa un monitor individual: hace check HTTP, crea PingLog y actualiza Monitor
    private async processMonitor(monitor: { id: string; url: string; frequency: number; name: string }) {
        const { id, url, frequency, name } = monitor;

        this.logger.log(`Checking monitor: ${name} (${url})`);

        try {
            // 1. Hacer petición HTTP
            const result = await this.checkUrl(url);

            // 2. Crear PingLog con el resultado
            await this.pingLogService.create({
                monitorId: id,
                statusCode: result.statusCode,
                durationMs: result.durationMs,
                success: result.success,
                error: result.error,
            })

            // 3. Actualizar Monitor
            const now = new Date();
            await this.prisma.monitor.update({
                where: { id },
                data: {
                    status: result.success ? 'UP' : 'DOWN',
                    lastCheck: now,
                    nextCheck: new Date(now.getTime() + frequency * 1000),
                },
            });

            this.logger.log(
                `Monitor ${name} checked: ${result.success ? 'UP' : 'DOWN'} (${result.durationMs}ms)`,
            );
        } catch (error) {
            this.logger.error(`Error processing monitor ${name}: ${error.message}`, error.stack);

            // Crear PingLog con error
            await this.pingLogService.create({
                monitorId: id,
                statusCode: 0,
                durationMs: 0,
                success: false,
                error: error.message,
                timestamp: new Date(),
            })
        }
    }

    // Hace una petición HTTP GET con timeout de 10 segundos
    private async checkUrl(url: string): Promise<CheckResult> {
        const startTime = Date.now();

        try {
            const response = await fetch(url, {
                method: 'GET',
                signal: AbortSignal.timeout(10000), 
                headers: {
                    'User-Agent': 'Server-Check-App/1.0',
                },
            });

            return {
                success: response.ok,
                statusCode: response.status,
                durationMs: Date.now() - startTime,
            };
        } catch (error) {
            return {
                success: false,
                statusCode: 0,
                durationMs: Date.now() - startTime,
                error: error.message || 'Unknown error',
            };
        }
    }
}
