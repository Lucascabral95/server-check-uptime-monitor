import { PartialType } from '@nestjs/mapped-types';
import { CreateUptimeDto } from './create-uptime.dto';
import { IsBoolean, IsDate, IsEnum, IsOptional } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateUptimeDto extends PartialType(CreateUptimeDto) {
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @IsDate()
    @IsOptional()
    lastCheck?: Date;

    @IsEnum(Status)
    @IsOptional()
    status?: Status;
}
