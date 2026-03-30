import { createZodDto } from "nestjs-zod";
import { createSaleItemSchema } from "@kosh/validation";
import { InputType, Field } from "@nestjs/graphql";

@InputType()
export class CreateSaleItemInput extends createZodDto(createSaleItemSchema) {
	@Field(() => String)
	variantId: string;

	@Field(() => Number)
	quantity: number;

	@Field(() => Number)
	sellPrice: number;

	@Field(() => Number)
	costPrice: number;
}
