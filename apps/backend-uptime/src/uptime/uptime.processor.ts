import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { Logger, Optional } from '@nestjs/common';
import { MonitorCheckService } from './services/monitor-check.service';
import { EmailService } from 'src/email/email.service';
import { envs } from 'src/config/envs.schema';
import { CheckRunService } from './services/check-run.service';
import { SecretEnvelopeService } from './services/secret-envelope.service';
import { EventsService } from './services/events.service';

// Seguro desde que uptime.service.ts hace el update de estado + incidente
// dentro de una transacción CAS (updateMany condicionado al status previo):
// dos jobs concurrentes del mismo monitor nunca duplican incidente ni email.
@Processor(QUEUES_NAME.UPTIME_MONITOR, { concurrency: envs.worker_concurrency })
export class UptimeProcessor extends WorkerHost {
  private readonly logger = new Logger(UptimeProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly checkRunService: CheckRunService,
    private readonly monitorCheckService: MonitorCheckService,
    private readonly emailService: EmailService,
    @InjectQueue(QUEUES_NAME.UPTIME_MONITOR_DLQ) private readonly dlq: Queue,
    @Optional() private readonly secretEnvelopeService?: SecretEnvelopeService,
    @Optional() private readonly eventsService?: EventsService,
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
          monitorType: true,
          config: true,
          heartbeatLastReceivedAt: true,
          heartbeatIntervalSeconds: true,
          heartbeatGraceSeconds: true,
          consecutiveFailures: true,
          consecutiveSuccesses: true,
          maintenanceUntil: true,
          workspaceId: true,
          maintenanceWindows: true,
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

    if (this.isInMaintenance(monitor)) {
      if (monitor.status !== 'MAINTENANCE') {
        await this.prisma.monitor.update({
          where: { id: monitor.id },
          data: { status: 'MAINTENANCE' },
        });
      }
      return;
    }

    const runId = String(job.id ?? `${monitorId}:${job.attemptsMade}`);
    const shouldProcess = await this.checkRunService.begin(runId, monitor.id);
    if (!shouldProcess) {
      this.logger.debug(`Check run ${runId} was already persisted, skipping duplicate delivery`);
      return;
    }

    // 2. Ejecutar el check HTTP usando el pool de conexiones
    let result;
    try {
      result = await this.monitorCheckService.execute({
        ...monitor,
        config: this.secretEnvelopeService?.revealConfig(monitor.config) ?? monitor.config,
      });
    } catch (error) {
      this.logger.error(`Error checking monitor ${monitorId}: ${error.message}`, error.stack);

      // Solo crear log de error si el monitor está activo (ya verificamos arriba)
      await this.checkRunService.recordFailure({
        runId,
        region: 'primary',
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
    const previousStatus = monitor.status === 'MAINTENANCE' ? 'PENDING' : monitor.status;
    const consecutiveFailures = result.success ? 0 : monitor.consecutiveFailures + 1;
    const consecutiveSuccesses = result.success ? monitor.consecutiveSuccesses + 1 : 0;
    const newStatus = result.success
      ? consecutiveSuccesses >= 2
        ? 'UP'
        : 'DEGRADED'
      : consecutiveFailures >= 2
        ? 'DOWN'
        : 'DEGRADED';

    // 3. Agregar al buffer de PingLogs (se escribirán en lote después)
    // 4. Actualizar estado del monitor + abrir/cerrar incidente, todo en
    // una transacción con compare-and-swap: el `updateMany` condicional
    // (where: status = previousStatus) toma el row lock del monitor, así
    // que si otro worker ya proceso este mismo monitor primero, `count`
    // da 0 y esta ejecución no toca incidentes ni manda email — evita
    // duplicar incidentes/emails si la concurrencia del worker sube de 1.
    const now = new Date();
    const { transitioned } = await this.prisma.$transaction(async tx => {
      await this.checkRunService.persistSuccess(tx, {
        runId,
        region: 'primary',
        monitorId: monitor.id,
        statusCode: result.statusCode,
        durationMs: result.durationMs,
        success: result.success,
        error: result.error,
      });

      const cas = await tx.monitor.updateMany({
        where: { id: monitor.id, status: monitor.status },
        data: { status: newStatus, lastCheck: now, consecutiveFailures, consecutiveSuccesses },
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

    this.eventsService?.publish({
      type:
        transitioned && previousStatus !== newStatus ? 'monitor.status_changed' : 'monitor.updated',
      monitorId: monitor.id,
      userId: monitor.userId,
      workspaceId: monitor.workspaceId,
      payload: { status: newStatus, previousStatus, durationMs: result.durationMs },
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
        await this.emailService.sendNotificationEmail(monitor.user.email, monitor.name, newStatus);
        this.logger.log(
          `Email enviado: ${monitor.name} cambió de ${previousStatus} a ${newStatus}`,
        );
      } catch (emailError) {
        this.logger.error(`Error enviando email para ${monitor.name}: ${emailError.message}`);
      }
    }

    this.logger.log(
      `Monitor ${monitor.name} checked: ${result.success ? 'UP' : 'DOWN'} (${result.durationMs}ms)`,
    );
  }

  private isInMaintenance(monitor: any): boolean {
    const now = new Date();
    if (monitor.maintenanceUntil && monitor.maintenanceUntil > now) return true;
    return monitor.maintenanceWindows?.some((window: any) => {
      if (!window.enabled) return false;
      try {
        const parts = new Intl.DateTimeFormat('en-US', {
          timeZone: window.timezone,
          weekday: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }).formatToParts(now);
        const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(
          parts.find(p => p.type === 'weekday')?.value ?? '',
        );
        const minute =
          Number(parts.find(p => p.type === 'hour')?.value ?? 0) * 60 +
          Number(parts.find(p => p.type === 'minute')?.value ?? 0);
        const endMinute = window.startMinute + window.durationMinutes;
        const startsToday = window.daysOfWeek.includes(weekday) && minute >= window.startMinute;
        const crossesMidnight =
          endMinute > 1440 &&
          window.daysOfWeek.includes((weekday + 6) % 7) &&
          minute < endMinute - 1440;
        return (startsToday && minute < endMinute) || crossesMidnight;
      } catch {
        return false;
      }
    });
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

      this.logger.warn(`Job ${job.id} moved to DLQ after ${job.attemptsMade} attempts`);
    } catch (dlqError) {
      this.logger.error(`Failed to move job to DLQ: ${dlqError.message}`, dlqError.stack);
    }
  }
}
