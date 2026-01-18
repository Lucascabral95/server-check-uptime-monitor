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

@Module({
    imports: [BullmqModule, PrismaModule, JwtModuleModule, PingLogModule],
    controllers: [UptimeController],
    providers: [
      UptimeService,
       UptimeProcessor,
        UserService,
         HttpPoolService,
        HttpPoolService, 
        PingLogBufferService, 
        ],
        exports: [HttpPoolService],
})
export class UptimeModule {}
