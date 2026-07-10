import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceRole } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: WorkspaceRole })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole;
}

export class CreateInvitationDto {
  @ApiProperty({ example: 'teammate@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: WorkspaceRole, default: WorkspaceRole.VIEWER })
  @IsEnum(WorkspaceRole)
  role: WorkspaceRole = WorkspaceRole.VIEWER;
}
