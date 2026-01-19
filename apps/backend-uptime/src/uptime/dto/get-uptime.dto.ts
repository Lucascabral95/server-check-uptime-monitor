import { ApiProperty } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsString, IsUUID, ValidateNested } from "class-validator";
import { GetPingLogDto } from "src/ping-log/dto";

export class GetUptimeDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    id: string;
    
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    userId: string;

    @ApiProperty({ example: 'Mi API Principal' })
    @IsString()
    name: string;
    
    @ApiProperty({ example: 'https://miapi.com/health' })
    @IsString()
    url: string;

    @ApiProperty({ example: 300 })
    @IsNumber()
    frequency: number;

    @ApiProperty({ example: true })
    @IsBoolean()
    isActive: boolean;

    @ApiProperty({ type: Date })
    @IsDate()
    nextCheck: Date;

    @ApiProperty({ type: Date })
    @IsDate()
    lastCheck: Date;

    @ApiProperty({ enum: Status })
    @IsEnum(Status)
    status: Status;

    @ApiProperty({ type: Date })
    @IsDate()
    createdAt: Date;

    @ApiProperty({ type: Date })
    @IsDate()
    updatedAt: Date;

    @ApiProperty({ type: [GetPingLogDto] })
    @IsArray()
    @Type(() => GetPingLogDto)
    @ValidateNested({ each: true })
    logs: GetPingLogDto[];
}