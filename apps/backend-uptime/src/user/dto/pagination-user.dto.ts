import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationUserDto {
  @ApiPropertyOptional({ description: 'Page number (starts at 1)', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class PaginatedUsersResponseDto<T> {
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
