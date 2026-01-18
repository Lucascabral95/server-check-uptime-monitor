import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePingLogDto {
    @IsUUID()
    monitorId: string; 

    @IsNumber()
    statusCode: number;

    @IsNumber()
    durationMs: number;

    @IsString()
    @IsOptional()
    error?: string;

    @IsBoolean()
    @IsOptional()
    success?: boolean;

    @IsDate()
    @IsOptional()
    timestamp?: Date;
}
