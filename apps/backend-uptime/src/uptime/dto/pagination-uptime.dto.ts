import { ApiPropertyOptional } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

export enum SortBy {
  RECENT = 'recent',
  OLDEST = 'oldest',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  STATUS_DOWN = 'status_down',
  STATUS_UP = 'status_up',
}

export class PaginationUptimeDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional({ enum: Status })
    @IsOptional()
    @IsEnum(Status)
    status?: Status;

    @ApiPropertyOptional({
      enum: SortBy,
      description: 'Ordenar resultados: recent (más recientes), oldest (más antiguos), name_asc (A-Z), name_desc (Z-A), status_down (fallidos primero), status_up (up primero)',
      example: SortBy.RECENT
    })
    @IsOptional()
    @IsEnum(SortBy)
    sortBy?: SortBy;

    @ApiPropertyOptional({
      description: 'Buscar por nombre o URL del monitor',
      example: 'google'
    })
    @IsOptional()
    @IsString()
    search?: string;
}

export class PaginatedResponseDto<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    nextPage: number | null;
    prevPage: number | null;
    totalItems: number;
    itemsPerPage: number;
  };
}
