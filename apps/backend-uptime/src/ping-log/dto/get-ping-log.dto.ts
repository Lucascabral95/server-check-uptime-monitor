import { IsBoolean, IsDate, IsNumber, IsString, IsUUID } from "class-validator";

export class GetPingLogDto {
    @IsUUID()
    id: string;
    
    @IsUUID()
    monitorId: string;

    @IsNumber()
    statusCode: number;

    @IsNumber()
    durationMs: number;

    @IsString()
    error?: string;

    @IsDate()
    timestamp: Date;

    @IsBoolean()
    success: boolean;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;
}