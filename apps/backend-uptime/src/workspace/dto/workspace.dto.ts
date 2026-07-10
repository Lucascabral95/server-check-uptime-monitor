import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, Matches } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { WorkspacePlan } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateWorkspaceDto {
  @ApiPropertyOptional({ example: 'Acme Engineering' })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @ApiPropertyOptional({ example: 'acme-engineering' })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;
}

export class CreateWorkspaceDto {
  @ApiProperty({ example: 'Acme Engineering' })
  @IsString()
  @Length(2, 120)
  name: string;
}

export class UpdateWorkspacePlanDto {
  @ApiProperty({ enum: WorkspacePlan })
  @IsEnum(WorkspacePlan)
  plan: WorkspacePlan;
}

export class CreateProjectDto {
  @ApiProperty({ example: 'Production API' })
  @IsString()
  @Length(2, 120)
  name: string;

  @ApiPropertyOptional({ example: 'Customer-facing production monitors' })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
