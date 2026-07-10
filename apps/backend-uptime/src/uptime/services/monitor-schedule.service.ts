import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Queue, RepeatableJob } from 'bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { PrismaService } from 'src/prisma/prisma.service';

interface MonitorScheduleSyncResult {
  created: boolean;
  removed: number;
}

@Injectable()
export class MonitorScheduleService {
  private readonly logger = new Logger(MonitorScheduleService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUES_NAME.UPTIME_MONITOR) private readonly monitorQueue: Queue,
  ) {}

  async synchronizeMonitor(monitorId: string): Promise<MonitorScheduleSyncResult> {
    const monitor = await this.prisma.monitor.findUnique({
      where: { id: monitorId },
      select: { id: true, frequency: true, isActive: true },
    });
    const jobId = this.getJobId(monitorId);
    const repeatableJobs = await this.monitorQueue.getRepeatableJobs();
    const monitorJobs = repeatableJobs.filter(job => job.id === jobId);
    const expectedInterval = monitor ? String(monitor.frequency * 1000) : undefined;

    if (
      monitor?.isActive &&
      monitorJobs.length === 1 &&
      monitorJobs[0].every === expectedInterval
    ) {
      return { created: false, removed: 0 };
    }

    await this.removeRepeatableJobs(monitorJobs);

    if (!monitor?.isActive) {
      this.logger.log(`Monitor schedule removed: ${monitorId}`);
      return { created: false, removed: monitorJobs.length };
    }

    await this.monitorQueue.add(
      'check-monitor',
      { monitorId },
      {
        jobId,
        repeat: { every: monitor.frequency * 1000 },
      },
    );

    this.logger.log(`Monitor schedule synchronized: ${monitorId}`);
    return { created: true, removed: monitorJobs.length };
  }

  async clearAll(): Promise<{ message: string; removedCount: number }> {
    try {
      const repeatableJobs = await this.monitorQueue.getRepeatableJobs();
      await this.removeRepeatableJobs(repeatableJobs);

      const waitingJobs = await this.monitorQueue.getJobs(['waiting', 'delayed'], 0, 1000);
      for (const job of waitingJobs) {
        await job.remove();
      }

      const removedCount = repeatableJobs.length + waitingJobs.length;
      this.logger.log(`Cleared ${removedCount} monitoring queue jobs`);

      return {
        message: 'Queue cleared successfully',
        removedCount,
      };
    } catch (error) {
      this.logger.error(`Queue cleanup failed: ${this.errorMessage(error)}`);
      throw new InternalServerErrorException('Failed to clear queue');
    }
  }

  async synchronizeAll(): Promise<{ orphanedRemoved: number; jobsCreated: number }> {
    try {
      const activeMonitors = await this.prisma.monitor.findMany({
        where: { isActive: true },
        select: { id: true },
      });
      const activeMonitorIds = new Set(activeMonitors.map(monitor => monitor.id));
      const repeatableJobs = await this.monitorQueue.getRepeatableJobs();
      const orphanedJobs = repeatableJobs.filter(
        job => this.isMonitorJob(job) && !activeMonitorIds.has(this.getMonitorId(job)),
      );

      await this.removeRepeatableJobs(orphanedJobs);

      let jobsCreated = 0;
      for (const monitor of activeMonitors) {
        const result = await this.synchronizeMonitor(monitor.id);
        if (result.created) {
          jobsCreated++;
        }
      }

      this.logger.log(
        `Queue sync completed: ${orphanedJobs.length} orphaned jobs removed, ${jobsCreated} jobs created`,
      );

      return {
        orphanedRemoved: orphanedJobs.length,
        jobsCreated,
      };
    } catch (error) {
      this.logger.error(`Queue synchronization failed: ${this.errorMessage(error)}`);
      throw new InternalServerErrorException('Failed to synchronize queue jobs');
    }
  }

  private async removeRepeatableJobs(jobs: RepeatableJob[]): Promise<void> {
    for (const job of jobs) {
      await this.monitorQueue.removeRepeatableByKey(job.key);
    }
  }

  private getJobId(monitorId: string): string {
    return `monitor:${monitorId}`;
  }

  private isMonitorJob(job: RepeatableJob): job is RepeatableJob & { id: string } {
    return typeof job.id === 'string' && job.id.startsWith('monitor:');
  }

  private getMonitorId(job: RepeatableJob & { id: string }): string {
    return job.id.substring('monitor:'.length);
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
  }
}
