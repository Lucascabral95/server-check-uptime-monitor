import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthRedisClient } from './health-redis.client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UptimeModule } from 'src/uptime/uptime.module';
import { PingLogModule } from 'src/ping-log/ping-log.module';

@Module({
  imports: [TerminusModule, PrismaModule, UptimeModule, PingLogModule],
  controllers: [HealthController],
  providers: [HealthRedisClient],
})
export class HealthModule {}
