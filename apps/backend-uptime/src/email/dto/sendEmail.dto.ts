import { Status } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString } from "class-validator";

export class SendEmailDto {
  @IsEmail()
  to: string;
  
  @IsString()
  subject: string;
  
  @IsString()
  textBody: string;
  
  @IsString()
  @IsOptional()
  html?: string;
}

export class SendNotificationEmailDto {
  @IsEmail()
  email: string;
  
  @IsString()
  nameServer: string;
  
  @IsEnum(Status)
  serverStatus: Status;
}
