import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { AlertSeverity, NotificationChannelType } from '@prisma/client';

export class CreateNotificationChannelDto {
  @IsString() name: string;
  @IsEnum(NotificationChannelType) type: NotificationChannelType;
  @IsObject() config: Record<string, unknown>;
}

export class CreateAlertPolicyDto {
  @IsString() name: string;
  @IsEnum(AlertSeverity) severity: AlertSeverity;
  @IsArray() @IsUUID('4', { each: true }) monitorIds: string[];
  @IsArray() @IsUUID('4', { each: true }) channelIds: string[];
  @IsInt() @Min(0) @Max(86400) @IsOptional() cooldownSeconds?: number;
  @IsBoolean() @IsOptional() recoveryEnabled?: boolean;
}
