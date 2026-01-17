import { Module } from '@nestjs/common';
import { UptimeService } from './uptime.service';
import { UptimeController } from './uptime.controller';
import { BullModule } from '@nestjs/bullmq';
import { UptimeProcessor } from './uptime.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'uptime-monitor',
    })
  ],
  controllers: [ UptimeController ],
  providers: [ UptimeService, UptimeProcessor ],
})
export class UptimeModule {}
