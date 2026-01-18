import { Module } from '@nestjs/common';
import { PingLogService } from './ping-log.service';
import { PingLogController } from './ping-log.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [ PrismaModule ],
  controllers: [PingLogController],
  providers: [PingLogService],
  exports: [ PingLogService ]
})
export class PingLogModule {}
