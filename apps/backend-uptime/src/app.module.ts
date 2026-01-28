import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { UptimeModule } from './uptime/uptime.module';
import { PingLogModule } from './ping-log/ping-log.module';
import { BullmqModule } from './bullmq/bullmq.module';
import { BullModule } from '@nestjs/bullmq';
import { envs } from './config/envs.schema';
import { JwtModuleModule } from './jwt-module/jwt-module.module';
import { EmailModule } from './email/email.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

        ThrottlerModule.forRoot([
            {
                name: "short",
                ttl: 1000,
                limit: 3,
            },
            {
                name: "medium",
                ttl: 10000,
                limit: 20,
            },
            {
                name: "long",
                ttl: 60000,
                limit: 100,
            },
        ]),

        BullModule.forRoot({
            connection: {
                host: envs.redis_host || 'localhost',
                port: envs.redis_port || 6379,
            },
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
