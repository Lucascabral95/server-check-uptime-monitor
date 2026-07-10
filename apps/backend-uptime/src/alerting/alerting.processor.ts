import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { QUEUES_NAME } from 'src/bullmq/bullmq.module';
import { AlertingService } from './alerting.service';

@Processor(QUEUES_NAME.NOTIFICATIONS, { concurrency: 5 })
export class AlertingProcessor extends WorkerHost {
  constructor(private readonly alerting: AlertingService) {
    super();
  }
  async process(job: Job<{ deliveryId: string }>) {
    await this.alerting.deliver(job.data.deliveryId);
  }
  async onModuleDestroy() {
    await this.worker.close();
  }
}
