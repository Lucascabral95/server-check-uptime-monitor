import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsDate, IsNumber, IsString, IsUUID } from "class-validator";

export class GetPingLogDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    id: string;
    
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
    error?: string;

    @ApiProperty({ example: '2025-10-15T10:30:00.000Z' })
    @IsDate()
    timestamp: Date;

    @ApiProperty({ example: true })
    @IsBoolean()
    success: boolean;

    @ApiProperty({ example: '2025-10-15T10:30:00.000Z' })
    @IsDate()
    createdAt: Date;

    @ApiProperty({ example: '2025-10-15T10:30:00.000Z' })
    @IsDate()
    updatedAt: Date;
}