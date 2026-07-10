import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger } from '@nestjs/common';
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { HttpPoolService } from './services/http-pool.service';
import { EmailService } from 'src/email/email.service';
import { envs } from 'src/config/envs.schema';

// Seguro desde que uptime.service.ts hace el update de estado + incidente
// dentro de una transacción CAS (updateMany condicionado al status previo):
// dos jobs concurrentes del mismo monitor nunca duplican incidente ni email.
@Processor(QUEUES_NAME.UPTIME_MONITOR, { concurrency: envs.worker_concurrency })
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

        // 1. Obtener información del monitor desde la DB
        let monitor;
        try {
            monitor = await this.prisma.monitor.findUnique({
                where: { id: monitorId },
                select: {
                    id: true,
                    userId: true,
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
        } catch (error) {
            this.logger.error(`Error fetching monitor ${monitorId}: ${error.message}`);
            if (job.attemptsMade >= (job.opts.attempts || 3)) {
                await this.moveToDLQ(job, error);
            }
            throw error;
        }

        if (!monitor) {
            this.logger.warn(`Monitor not found: ${monitorId}. Removing orphaned job from queue.`);
            // Remove the orphaned job from the queue to prevent repeated warnings
            await job.remove();
            return;
        }

        // Si el monitor está inactivo, skip - NO crear logs
        if (!monitor.isActive) {
            this.logger.debug(`Monitor is inactive: ${monitorId}, skipping check and log creation`);
            return;
        }

        // 2. Ejecutar el check HTTP usando el pool de conexiones
        let result;
        try {
            result = await this.httpPoolService.checkUrl(monitor.url, 10000);
        } catch (error) {
            this.logger.error(
                `Error checking monitor ${monitorId}: ${error.message}`,
                error.stack,
            );

            // Solo crear log de error si el monitor está activo (ya verificamos arriba)
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

        // 4. Actualizar estado del monitor + abrir/cerrar incidente, todo en
        // una transacción con compare-and-swap: el `updateMany` condicional
        // (where: status = previousStatus) toma el row lock del monitor, así
        // que si otro worker ya proceso este mismo monitor primero, `count`
        // da 0 y esta ejecución no toca incidentes ni manda email — evita
        // duplicar incidentes/emails si la concurrencia del worker sube de 1.
        const now = new Date();
        const { transitioned } = await this.prisma.$transaction(async (tx) => {
            const cas = await tx.monitor.updateMany({
                where: { id: monitor.id, status: previousStatus },
                data: { status: newStatus, lastCheck: now },
            });

            if (cas.count === 0) {
                return { transitioned: false };
            }

            if (previousStatus !== 'DOWN' && newStatus === 'DOWN') {
                // Abre un incidente. El índice parcial único
                // (incidents_one_ongoing_per_monitor) es la red de seguridad:
                // si por alguna razón ya hay uno ONGOING, P2002 y no pasa nada.
                try {
                    await tx.incident.create({
                        data: {
                            monitorId: monitor.id,
                            userId: monitor.userId,
                            status: 'ONGOING',
                            startedAt: now,
                            firstStatusCode: result.statusCode,
                            firstError: result.error ?? null,
                            lastError: result.error ?? null,
                        },
                    });
                } catch (error) {
                    if (error?.code !== 'P2002') throw error;
                }
            } else if (previousStatus === 'DOWN' && newStatus === 'UP') {
                await tx.incident.updateMany({
                    where: { monitorId: monitor.id, status: 'ONGOING' },
                    data: { status: 'RESOLVED', endedAt: now },
                });
            } else if (previousStatus === 'DOWN' && newStatus === 'DOWN') {
                // Sigue caído: no es una transición, pero enriquecemos el
                // incidente abierto con el último error y el conteo de checks.
                await tx.incident.updateMany({
                    where: { monitorId: monitor.id, status: 'ONGOING' },
                    data: {
                        lastError: result.error ?? null,
                        affectedChecks: { increment: 1 },
                    },
                });
            }

            return { transitioned: true };
        });

        // 5. Enviar email si el estado cambió (UP↔DOWN), no es el primer log
        // (PENDING→UP/DOWN), y esta ejecución fue realmente la que causó la
        // transición (evita doble email bajo concurrencia).
        const shouldSendEmail =
            transitioned &&
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
