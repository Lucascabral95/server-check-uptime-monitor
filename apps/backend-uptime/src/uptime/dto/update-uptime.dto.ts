import { PartialType } from '@nestjs/mapped-types';
import { CreateUptimeDto } from './create-uptime.dto';

export class UpdateUptimeDto extends PartialType(CreateUptimeDto) {}
