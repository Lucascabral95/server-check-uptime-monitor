import { Body, Controller, Get, Param, Patch, Request, UseGuards } from '@nestjs/common';
import { IsNumber, Max, Min } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MonitorOwnerGuard } from 'src/auth/guards/monitor-owner.guard';
import { RequestUserDto } from 'src/user/dto';
import { SloService } from './slo.service';
class SloDto {
  @IsNumber() @Min(90) @Max(100) target: number;
  @IsNumber() @Min(1) @Max(365) periodDays = 30;
}
@Controller('slo')
@UseGuards(JwtAuthGuard, MonitorOwnerGuard)
export class SloController {
  constructor(private readonly slo: SloService) {}
  @Get(':monitorId') get(@Param('monitorId') id: string) {
    return this.slo.get(id);
  }
  @Patch(':monitorId') set(@Param('monitorId') id: string, @Body() dto: SloDto) {
    return this.slo.set(id, dto.target, dto.periodDays);
  }
}
