import { Type } from "class-transformer";
import { IsArray, IsDecimal, IsEnum, IsOptional, IsString, IsUUID, Min, ValidateNested } from "class-validator";
import { CreateSaleItemDto } from "./CreateSaleItemDto.dto";

export enum PaymentType {
	CASH = "CASH",
	ONLINE = "ONLINE",
	CREDIT = "CREDIT",
}

export class CreateSaleDto {
	@Type(() => Number)
	@IsDecimal()
	@Min(0)
	discount: number;

	@IsEnum(PaymentType)
	paymentType: PaymentType;

	@IsOptional()
	@IsUUID()
	creditId?: string;

	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateSaleItemDto)
	items: CreateSaleItemDto[];

	@IsOptional()
	@IsString()
	transactionNote?: string;
}
