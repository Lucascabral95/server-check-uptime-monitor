import { Module } from '@nestjs/common';
import { PingLogService } from './ping-log.service';
import { PingLogController } from './ping-log.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PingLogBufferService } from './ping-log-buffer.service';
import { UserModule } from 'src/user/user.module';
import { PingLogOwnerGuard } from 'src/auth/guards/ping-log-owner.guard';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [PingLogController],
  providers: [PingLogService, PingLogBufferService, PingLogOwnerGuard],
  exports: [PingLogService, PingLogBufferService],
})
export class PingLogModule {}
