import { Status } from "@prisma/client";
import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsString, IsUUID, ValidateNested } from "class-validator";
import { GetPingLogDto } from "src/ping-log/dto";

export class GetUptimeDto {
    @IsUUID()
    id: string;
    
    @IsUUID()
    userId: string;

    @IsString()
    name: string;
    
    @IsString()
    url: string;

    @IsNumber()
    frequency: number;

    @IsBoolean()
    isActive: boolean;

    @IsDate()
    nextCheck: Date;

    @IsDate()
    lastCheck: Date;

    @IsEnum(Status)
    status: Status;

    @IsDate()
    createdAt: Date;

    @IsDate()
    updatedAt: Date;

    @IsArray()
    @Type(() => GetPingLogDto)
    @ValidateNested({ each: true })
    logs: GetPingLogDto[];
}