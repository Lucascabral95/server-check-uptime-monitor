import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';

export const QUEUES_NAME = {
    UPTIME_MONITOR: 'uptime-monitor',
};

@Module({
    imports: [
        BullModule.registerQueue({
            name: QUEUES_NAME.UPTIME_MONITOR,
        }),
    ],
    exports: [
        BullModule.registerQueue({
            name: QUEUES_NAME.UPTIME_MONITOR,
        }),
    ],
})
export class BullmqModule {}
