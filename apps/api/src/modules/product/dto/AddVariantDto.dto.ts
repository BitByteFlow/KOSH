/* eslint-disable prettier/prettier */
import { Type } from "class-transformer";
import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	Min,
	MinLength,
	ValidateNested,
} from "class-validator";

export class CreateVariantDto {
	@IsNumber()
	@Min(0)
	costPrice: number;

	@IsNumber()
	@Min(0)
	sellingPrice: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	stock?: number = 0;

	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AttributeDto)
	attributes?: AttributeDto[];
}

class AttributeDto {
	@IsNotEmpty()
	@MinLength(2, { message: "Name must be at least 2 characters" })
	name: string;

	@IsNotEmpty()
	value: string;
}
