import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";

export class CreatePingLogDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    monitorId: string; 

    @ApiProperty({ example: 200 })
    @IsNumber()
    statusCode: number;

    @ApiProperty({ example: 150 })
    @IsNumber()
    durationMs: number;

    @ApiProperty({ example: 'Connection timeout' })
    @IsString()
    @IsOptional()
    error?: string;

    @ApiProperty({ example: true })
    @IsBoolean()
    @IsOptional()
    success?: boolean;

    @ApiProperty({ example: '2025-10-15T10:30:00.000Z' })
    @IsDate()
    @IsOptional()
    timestamp?: Date;
}
