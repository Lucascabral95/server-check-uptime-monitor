import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MonitorType } from '@prisma/client';
import { IsSafeMonitorUrl } from 'src/common/security/is-safe-monitor-url.decorator';
import { MaintenanceWindowDto } from './maintenance-window.dto';

export class CreateUptimeDto {
  @ApiProperty({ example: 'Mi API Principal' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'https://miapi.com/health' })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @IsSafeMonitorUrl()
  url: string;

  @ApiProperty({ example: 300, description: 'Frecuencia en segundos' })
  @IsNumber()
  @Min(60) // Mínimo 60 segundos (1 minuto)
  @Max(86400) // Máximo 86400 segundos (1 día)
  frequency: number;

  @ApiPropertyOptional({ enum: MonitorType, default: MonitorType.HTTP })
  @IsEnum(MonitorType)
  @IsOptional()
  monitorType?: MonitorType;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @ApiPropertyOptional({ minimum: 10, maximum: 86400 })
  @IsNumber()
  @Min(10)
  @Max(86400)
  @IsOptional()
  heartbeatIntervalSeconds?: number;

  @ApiPropertyOptional({ minimum: 0, maximum: 86400 })
  @IsNumber()
  @Min(0)
  @Max(86400)
  @IsOptional()
  heartbeatGraceSeconds?: number;

  @ApiPropertyOptional({ type: Date })
  @IsDate()
  @IsOptional()
  nextCheck?: Date;

  @ApiPropertyOptional({ type: MaintenanceWindowDto, isArray: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MaintenanceWindowDto)
  maintenanceWindows?: MaintenanceWindowDto[];
}
