import { IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";

export class GetTransactionsQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	limit?: number = 10;

	@IsOptional()
	@IsEnum(["createdAt", "amount", "type"])
	sortBy?: "createdAt" | "amount" | "type" = "createdAt";

	@IsOptional()
	@IsEnum(["asc", "desc"])
	sortOrder?: "asc" | "desc" = "desc";
}
