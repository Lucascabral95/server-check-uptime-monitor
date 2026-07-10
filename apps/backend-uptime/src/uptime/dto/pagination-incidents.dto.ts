import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum IncidentSortBy {
  RECENT = 'recent',
  OLDEST = 'oldest',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  DURATION_LONGEST = 'duration_longest',
  DURATION_SHORTEST = 'duration_shortest',
}

export class PaginationIncidentsDto {
  @ApiPropertyOptional({ description: 'Page number (starts at 1)', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    enum: IncidentSortBy,
    description: 'Ordenar incidentes: recent (más recientes), oldest (más antiguos), name_asc (A-Z), name_desc (Z-A), duration_longest (mayor tiempo caído), duration_shortest (menor tiempo caído)',
    example: IncidentSortBy.RECENT
  })
  @IsOptional()
  @IsEnum(IncidentSortBy)
  sortBy?: IncidentSortBy;

  @ApiPropertyOptional({
    description: 'Buscar por nombre o URL del monitor',
    example: 'google'
  })
  @IsOptional()
  @IsString()
  search?: string;
}
