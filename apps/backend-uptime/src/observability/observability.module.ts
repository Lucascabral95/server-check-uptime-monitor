import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HttpMetricsInterceptor } from './http-metrics.interceptor';
import { MetricsService } from './metrics.service';
import { ObservabilityController } from './observability.controller';
import { InternalAlertService } from './internal-alert.service';
import { QueueMetricsService } from './queue-metrics.service';
import { BullmqModule } from 'src/bullmq/bullmq.module';
import { UserModule } from 'src/user/user.module';
import { JwtModuleModule } from 'src/jwt-module/jwt-module.module';
@Global()
@Module({
  imports: [BullmqModule, UserModule, JwtModuleModule],
  controllers: [ObservabilityController],
  providers: [
    MetricsService,
    InternalAlertService,
    QueueMetricsService,
    { provide: APP_INTERCEPTOR, useClass: HttpMetricsInterceptor },
  ],
  exports: [MetricsService, InternalAlertService],
})
export class ObservabilityModule {}
