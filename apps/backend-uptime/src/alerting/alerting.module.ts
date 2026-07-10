import { Module } from '@nestjs/common';
import { BullmqModule } from 'src/bullmq/bullmq.module';
import { EmailModule } from 'src/email/email.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UptimeModule } from 'src/uptime/uptime.module';
import { UserModule } from 'src/user/user.module';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';
import { AlertingController } from './alerting.controller';
import { AlertingProcessor } from './alerting.processor';
import { AlertingService } from './alerting.service';
import { IncidentCollaborationController } from './incident-collaboration.controller';

@Module({
  imports: [PrismaModule, BullmqModule, EmailModule, UserModule, JwtModuleModule, UptimeModule],
  controllers: [AlertingController, IncidentCollaborationController],
  providers: [AlertingService, AlertingProcessor],
  exports: [AlertingService],
})
export class AlertingModule {}
