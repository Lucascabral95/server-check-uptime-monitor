import { Body, Controller, Get, Headers, Param, Post, UseGuards } from '@nestjs/common';
import { IsBoolean, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '@prisma/client';
import { ProbeAgentService } from './probe-agent.service';

class RegisterDto {
  @IsString() name: string;
  @IsString() region: string;
  @IsString() version: string;
}
class HeartbeatDto {
  @IsString() version: string;
  @IsInt() @Min(0) queueLagMs: number;
  @IsInt() @Min(0) capacity: number;
}
class ResultDto {
  @IsString() runId: string;
  @IsUUID() monitorId: string;
  @IsBoolean() success: boolean;
  @IsInt() statusCode: number;
  @IsInt() @Min(0) durationMs: number;
  @IsOptional() @IsString() error?: string;
}

@Controller('probe-agents')
export class ProbeAgentController {
  constructor(private readonly agents: ProbeAgentService) {}
  @Post() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) register(
    @Body() dto: RegisterDto,
  ) {
    return this.agents.register(dto.name, dto.region, dto.version);
  }
  @Post(':region/heartbeat') heartbeat(
    @Param('region') region: string,
    @Headers('x-probe-token') token: string,
    @Body() dto: HeartbeatDto,
  ) {
    return this.agents.heartbeat(region, token, dto.version, dto.queueLagMs, dto.capacity);
  }
  @Get(':region/jobs') jobs(
    @Param('region') region: string,
    @Headers('x-probe-token') token: string,
  ) {
    return this.agents.claimJobs(region, token);
  }
  @Post(':region/results') result(
    @Param('region') region: string,
    @Headers('x-probe-token') token: string,
    @Headers('x-probe-signature') signature: string,
    @Body() dto: ResultDto,
  ) {
    return this.agents.receiveResult(region, token, dto, signature);
  }
  @Get() @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) list() {
    return this.agents.listAgents();
  }
  @Get('health') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(Role.ADMIN) health() {
    return this.agents.health();
  }
}
