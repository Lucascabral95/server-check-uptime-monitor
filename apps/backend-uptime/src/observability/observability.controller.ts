import { Controller, Get, Header, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { InternalAlertService } from './internal-alert.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('metrics')
export class ObservabilityController {
  constructor(
    private readonly metrics: MetricsService,
    private readonly alertsService: InternalAlertService,
  ) {}
  @Get() @Header('Content-Type', 'text/plain; version=0.0.4; charset=utf-8') metricsEndpoint() {
    return this.metrics.metrics();
  }
  @Get('internal-alerts') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) alerts() {
    return this.alertsService.list();
  }
}
