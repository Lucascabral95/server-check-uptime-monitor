import { IsDate, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Max, Min } from 'class-validator';

export class CreateUptimeDto {
    @IsUUID()
    userId: string;

    @IsString()
    name: string;

    @IsUrl()
    url: string;

    @IsNumber()
    @Min(60) // Mínimo 60 segundos (1 minuto)
    @Max(86400) // Máximo 86400 segundos (1 día)
    frequency: number;

    @IsDate()
    @IsOptional()
    nextCheck?: Date;
}
