import { PartialType } from '@nestjs/mapped-types';
import { CreateUptimeDto } from './create-uptime.dto';
import { IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';
import { Status } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUptimeDto extends PartialType(CreateUptimeDto) {
    @ApiPropertyOptional()
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
    
    @ApiPropertyOptional({ type: Date })
    @IsDate()
    @IsOptional()
    lastCheck?: Date;

    @ApiPropertyOptional({ enum: Status })
    @IsEnum(Status)
    @IsOptional()
    status?: Status;
}
