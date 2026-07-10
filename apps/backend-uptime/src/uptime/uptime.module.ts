import { Module } from '@nestjs/common';
import { UptimeService } from './uptime.service';
import { UptimeController } from './uptime.controller';
import { UptimeProcessor } from './uptime.processor';
import { BullmqModule } from 'src/bullmq/bullmq.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';
import { UserService } from 'src/user/user.service';
import { PingLogModule } from 'src/ping-log/ping-log.module';
import { HttpPoolService } from './services/http-pool.service';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';
import { MonitorOwnerGuard } from 'src/auth/guards/monitor-owner.guard';
import { GracefulShutdownService } from './graceful-shutdown.service';
import { IncidentReconcilerService } from './incident-reconciler.service';
import { MonitorScheduleOutboxService } from './services/monitor-schedule-outbox.service';
import { MonitorScheduleService } from './services/monitor-schedule.service';
import { CheckRunService } from './services/check-run.service';
import { WorkspaceModule } from 'src/workspace/workspace.module';
import { WorkspaceMonitorController } from './workspace-monitor.controller';
import { MonitorCheckService } from './services/monitor-check.service';
import { HeartbeatService } from './heartbeat.service';
import { HeartbeatController } from './heartbeat.controller';
import { SecretEnvelopeService } from './services/secret-envelope.service';
import { MonitorAggregateService } from './services/monitor-aggregate.service';
import { EventsService } from './services/events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    BullmqModule,
    PrismaModule,
    JwtModuleModule,
    PingLogModule,
    EmailModule,
    WorkspaceModule,
  ],
  controllers: [
    UptimeController,
    WorkspaceMonitorController,
    HeartbeatController,
    EventsController,
  ],
  providers: [
    UptimeService,
    UptimeProcessor,
    UserService,
    HttpPoolService,
    EmailService,
    MonitorOwnerGuard,
    GracefulShutdownService,
    IncidentReconcilerService,
    MonitorScheduleService,
    MonitorScheduleOutboxService,
    CheckRunService,
    MonitorCheckService,
    HeartbeatService,
    SecretEnvelopeService,
    MonitorAggregateService,
    EventsService,
  ],
  exports: [HttpPoolService, SecretEnvelopeService, EventsService],
})
export class UptimeModule {}
