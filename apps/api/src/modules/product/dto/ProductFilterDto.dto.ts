import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsEnum, IsNumber, IsOptional, IsString, IsUUID,
    Max, Min
} from 'class-validator';

export class PaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';

    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'desc';
}


export class ProductFilterDto extends PaginationDto {
    @IsOptional()
    @IsUUID()
    categoryId?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    lowStock?: number;

    @IsOptional()
    @IsString()
    search?: string;
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    minPrice?: number;

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    maxPrice?: number;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    includeDeleted?: boolean = false;
}