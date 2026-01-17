import { Status } from "@prisma/client";
import { IsArray, IsBoolean, IsDate, IsEnum, IsNumber, IsString, IsUUID } from "class-validator";

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
    logs: any[];
}