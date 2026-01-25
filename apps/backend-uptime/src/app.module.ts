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

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),

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
    providers: [AppService],
})
export class AppModule {}
