import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { UptimeModule } from './uptime/uptime.module';
import { PingLogModule } from './ping-log/ping-log.module';
import { BullmqModule, redisConnection } from './bullmq/bullmq.module';
import { BullModule } from '@nestjs/bullmq';
import { JwtModuleModule } from './jwt-module/jwt-module.module';
import { EmailModule } from './email/email.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';

const MULTIPLIER_THROTTLER = 10;

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        HealthModule,

        ThrottlerModule.forRoot([
            {
                name: "short",
                ttl: 1000,
                limit: 3 * MULTIPLIER_THROTTLER,
            },
            {
                name: "medium",
                ttl: 10000,
                limit: 20 * MULTIPLIER_THROTTLER,
            },
            {
                name: "long",
                ttl: 60000,
                limit: 100 * MULTIPLIER_THROTTLER,
            },
        ]),

        BullModule.forRoot({
            connection: redisConnection,
        }),

        PrismaModule,
        UserModule,
        UptimeModule,
        PingLogModule,
        BullmqModule,
        JwtModuleModule,
        EmailModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        }
    ],
})
export class AppModule {}