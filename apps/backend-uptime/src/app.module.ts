import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { envs } from './config/envs.schema';
import { UptimeModule } from './uptime/uptime.module';

@Module({
  imports: [PrismaModule, UserModule,
      ConfigModule.forRoot({ isGlobal: true }),

      BullModule.forRoot({
        connection: {
          host: envs.redis_host || "localhost",
          port: envs.redis_port || 6379,
        } 
      }),

      UptimeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
