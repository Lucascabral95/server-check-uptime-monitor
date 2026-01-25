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
import { PingLogBufferService } from 'src/ping-log/ping-log-buffer.service';
import { EmailService } from 'src/email/email.service';
import { EmailModule } from 'src/email/email.module';

@Module({
    imports: [
      BullmqModule,
      PrismaModule,
      JwtModuleModule,
      PingLogModule,
      EmailModule,
      ],
    controllers: [UptimeController],
    providers: [
      UptimeService,
      UptimeProcessor,
      UserService,
      HttpPoolService,
      HttpPoolService, 
      PingLogBufferService,
      EmailService,
      ],
    exports: [HttpPoolService],
})
export class UptimeModule {}
