import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { envs } from 'src/config/envs.schema';
import { PrismaService } from 'src/prisma/prisma.service';
import { MonitorScheduleService } from './monitor-schedule.service';

@Injectable()
export class MonitorScheduleOutboxService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MonitorScheduleOutboxService.name);
  private readonly workerId = randomUUID();
  private interval: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly monitorScheduleService: MonitorScheduleService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.processAvailableEvents();
    this.interval = setInterval(() => {
      void this.processAvailableEvents();
    }, envs.outbox_poll_interval_ms);
  }

  onModuleDestroy(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async enqueue(transaction: Prisma.TransactionClient, monitorId: string): Promise<void> {
    await transaction.monitorScheduleOutbox.create({
      data: { monitorId },
    });
  }

  async processAvailableEvents(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      const now = new Date();
      const events = await this.prisma.monitorScheduleOutbox.findMany({
        where: {
          processedAt: null,
          availableAt: { lte: now },
          OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
        },
        orderBy: { createdAt: 'asc' },
        take: envs.outbox_batch_size,
      });

      for (const event of events) {
        await this.processEvent(event.id, event.monitorId, event.attempts + 1);
      }
    } catch (error) {
      this.logger.error(`Monitor schedule outbox polling failed: ${this.errorMessage(error)}`);
    } finally {
      this.isProcessing = false;
    }
  }

  private async processEvent(eventId: string, monitorId: string, attempt: number): Promise<void> {
    const now = new Date();
    const leaseUntil = new Date(now.getTime() + envs.outbox_lease_duration_ms);
    const claim = await this.prisma.monitorScheduleOutbox.updateMany({
      where: {
        id: eventId,
        processedAt: null,
        availableAt: { lte: now },
        OR: [{ lockedUntil: null }, { lockedUntil: { lt: now } }],
      },
      data: {
        attempts: { increment: 1 },
        lockedAt: now,
        lockedUntil: leaseUntil,
        lockedBy: this.workerId,
      },
    });

    if (claim.count === 0) {
      return;
    }

    try {
      await this.monitorScheduleService.synchronizeMonitor(monitorId);
      await this.prisma.monitorScheduleOutbox.updateMany({
        where: { id: eventId, processedAt: null, lockedBy: this.workerId },
        data: {
          processedAt: new Date(),
          lockedAt: null,
          lockedUntil: null,
          lockedBy: null,
          lastError: null,
        },
      });
    } catch (error) {
      const retryDelay = this.getRetryDelay(attempt);
      await this.prisma.monitorScheduleOutbox.updateMany({
        where: { id: eventId, processedAt: null, lockedBy: this.workerId },
        data: {
          availableAt: new Date(Date.now() + retryDelay),
          lockedAt: null,
          lockedUntil: null,
          lockedBy: null,
          lastError: this.errorMessage(error),
        },
      });
      this.logger.error(
        `Monitor schedule synchronization failed for ${monitorId}; retrying in ${retryDelay}ms: ${this.errorMessage(error)}`,
      );
    }
  }

  private getRetryDelay(attempt: number): number {
    return Math.min(
      envs.outbox_retry_base_delay_ms * 2 ** (attempt - 1),
      envs.outbox_retry_max_delay_ms,
    );
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
