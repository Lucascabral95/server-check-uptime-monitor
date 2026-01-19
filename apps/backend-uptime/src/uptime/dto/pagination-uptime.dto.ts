import { ApiPropertyOptional } from "@nestjs/swagger";
import { Status } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";

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