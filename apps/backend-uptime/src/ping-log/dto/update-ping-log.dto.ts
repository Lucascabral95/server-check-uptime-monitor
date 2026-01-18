import { PartialType } from '@nestjs/mapped-types';
import { CreatePingLogDto } from './create-ping-log.dto';

export class UpdatePingLogDto extends PartialType(CreatePingLogDto) {}
