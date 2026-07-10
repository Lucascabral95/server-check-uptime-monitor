import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Max, Min } from 'class-validator';
import { IsSafeMonitorUrl } from 'src/common/security/is-safe-monitor-url.decorator';

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

    @ApiPropertyOptional({ type: Date })
    @IsDate()
    @IsOptional()
    nextCheck?: Date;
}
