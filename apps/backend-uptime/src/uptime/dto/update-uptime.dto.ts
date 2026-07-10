import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MonitorType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceWindowDto } from './maintenance-window.dto';

export class UpdateUptimeDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 300, description: 'Frecuencia en segundos' })
  @IsNumber()
  @Min(60) // Mínimo 60 segundos (1 minuto)
  @Max(86400) // Máximo 86400 segundos (1 día)
  @IsOptional()
  frequency?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: MonitorType })
  @IsEnum(MonitorType)
  @IsOptional()
  monitorType?: MonitorType;

  @ApiPropertyOptional({ type: Object })
  @IsObject()
  @IsOptional()
  config?: Record<string, unknown>;

  @ApiPropertyOptional({ type: Date, nullable: true })
  @IsDateString()
  @IsOptional()
  maintenanceUntil?: string | null;

  @ApiPropertyOptional({ type: MaintenanceWindowDto, isArray: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MaintenanceWindowDto)
  maintenanceWindows?: MaintenanceWindowDto[];
}
