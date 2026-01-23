import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}
