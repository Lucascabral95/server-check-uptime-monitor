import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { MetricsService } from './metrics.service';
@Injectable()
export class QueueMetricsService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;
  constructor(
    @InjectQueue(QUEUES_NAME.UPTIME_MONITOR) private readonly monitorQueue: Queue,
    @InjectQueue(QUEUES_NAME.NOTIFICATIONS) private readonly notificationQueue: Queue,
    private readonly metrics: MetricsService,
  ) {}
  onModuleInit() {
    this.timer = setInterval(() => void this.collect(), 30000);
    void this.collect();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
  private async collect() {
    try {
      const queues = [
        [QUEUES_NAME.UPTIME_MONITOR, this.monitorQueue],
        [QUEUES_NAME.NOTIFICATIONS, this.notificationQueue],
      ] as const;
      for (const [name, queue] of queues) {
        const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'failed');
        this.metrics.queueDepth.set(
          { queue: name },
          counts.waiting + counts.active + counts.delayed + counts.failed,
        );
      }
    } catch {
      /* Redis health is exposed by readiness; metrics collection must not crash the process. */
    }
  }
}
