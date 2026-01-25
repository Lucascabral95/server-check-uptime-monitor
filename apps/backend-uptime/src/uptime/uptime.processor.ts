import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { HttpPoolService } from './services/http-pool.service';
import { EmailService } from 'src/email/email.service';

@Processor(QUEUES_NAME.UPTIME_MONITOR)
export class UptimeProcessor extends WorkerHost {
    private readonly logger = new Logger(UptimeProcessor.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly pingLogBufferService: PingLogBufferService,
        private readonly httpPoolService: HttpPoolService,
        private readonly emailService: EmailService,
        @InjectQueue(QUEUES_NAME.UPTIME_MONITOR_DLQ) private readonly dlq: Queue,
    ) {
        super();
    }

    //  Procesa un job de check individual para un monitor específico.
    async process(job: Job): Promise<void> {
        const { monitorId } = job.data;

        // Validar que el job tenga el formato correcto
        if (!monitorId) {
            this.logger.warn(
                `Skipping job with invalid data format: ${JSON.stringify(job.data)}. This is likely a legacy job from the old architecture.`,
            );
            // Remover job inválido para que no se reintente
            await job.remove();
            return;
        }

        this.logger.debug(`Processing check for monitor: ${monitorId}`);

        try {
            // 1. Obtener información del monitor desde la DB
            const monitor = await this.prisma.monitor.findUnique({
                where: { id: monitorId },
                select: {
                    id: true,
                    name: true,
                    url: true,
                    frequency: true,
                    isActive: true,
                    status: true,
                    user: {
                        select: {
                            email: true,
                        },
                    },
                },
            });

            if (!monitor) {
                this.logger.warn(`Monitor not found: ${monitorId}`);
                return;
            }

            // Si el monitor está inactivo, skip
            if (!monitor.isActive) {
                this.logger.debug(`Monitor is inactive: ${monitorId}`);
                return;
            }

            // 2. Ejecutar el check HTTP usando el pool de conexiones
            const result = await this.httpPoolService.checkUrl(monitor.url, 10000);

            // Guardar el estado anterior antes del update
            const previousStatus = monitor.status;
            const newStatus = result.success ? 'UP' : 'DOWN';

            // 3. Agregar al buffer de PingLogs (se escribirán en lote después)
            this.pingLogBufferService.add({
                monitorId: monitor.id,
                statusCode: result.statusCode,
                durationMs: result.durationMs,
                success: result.success,
                error: result.error,
            });

            // 4. Actualizar estado del monitor
            const now = new Date();
            await this.prisma.monitor.update({
                where: { id: monitor.id },
                data: {
                    status: newStatus,
                    lastCheck: now,
                },
            });

            // 5. Enviar email si el estado cambió (UP↔DOWN) y no es el primer log (PENDING→UP/DOWN)
            const shouldSendEmail =
                (previousStatus === 'UP' || previousStatus === 'DOWN') &&
                previousStatus !== newStatus;

            if (shouldSendEmail) {
                try {
                    await this.emailService.sendNotificationEmail(
                        monitor.user.email,
                        monitor.name,
                        newStatus,
                    );
                    this.logger.log(
                        `Email enviado: ${monitor.name} cambió de ${previousStatus} a ${newStatus}`,
                    );
                } catch (emailError) {
                    this.logger.error(
                        `Error enviando email para ${monitor.name}: ${emailError.message}`,
                    );
                }
            }

            this.logger.log(
                `Monitor ${monitor.name} checked: ${result.success ? 'UP' : 'DOWN'} (${result.durationMs}ms)`,
            );
        } catch (error) {
            this.logger.error(
                `Error processing monitor ${monitorId}: ${error.message}`,
                error.stack,
            );

            this.pingLogBufferService.add({
                monitorId,
                statusCode: 0,
                durationMs: 0,
                success: false,
                error: error.message,
            });

            if (job.attemptsMade >= (job.opts.attempts || 3)) {
                await this.moveToDLQ(job, error);
            }

            throw error;
        }
    }

    // Mueve un job fallido a la Dead Letter Queue para retries extendidos.
    private async moveToDLQ(job: Job, error: Error): Promise<void> {
        try {
            await this.dlq.add(
                `failed-${job.id}`,
                {
                    originalJob: job.data,
                    error: error.message,
                    failedAt: new Date(),
                    attempts: job.attemptsMade,
                },
                {
                    attempts: 5, 
                    backoff: {
                        type: 'exponential',
                        delay: 30000, 
                    },
                },
            );

            this.logger.warn(
                `Job ${job.id} moved to DLQ after ${job.attemptsMade} attempts`,
            );
        } catch (dlqError) {
            this.logger.error(
                `Failed to move job to DLQ: ${dlqError.message}`,
                dlqError.stack,
            );
        }
    }
}
