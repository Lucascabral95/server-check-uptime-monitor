import { Module } from '@nestjs/common';
import { PingLogService } from './ping-log.service';
import { PingLogController } from './ping-log.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PingLogBufferService } from './ping-log-buffer.service';

@Module({
    imports: [PrismaModule],
    controllers: [PingLogController],
    providers: [PingLogService, PingLogBufferService],
    exports: [PingLogService, PingLogBufferService],
})
export class PingLogModule {}
