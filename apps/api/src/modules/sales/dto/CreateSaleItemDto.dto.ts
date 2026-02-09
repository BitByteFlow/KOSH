import { IsDecimal, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateSaleItemDto {
	@IsUUID()
	variantId: string;

	@Type(() => Number)
	@IsInt()
	@Min(1)
	quantity: number;

	@Type(() => Number)
	@IsDecimal()
	@Min(0)
	sellPrice: number;

	@Type(() => Number)
	@IsDecimal()
	@Min(0)
	costPrice: number;
}
