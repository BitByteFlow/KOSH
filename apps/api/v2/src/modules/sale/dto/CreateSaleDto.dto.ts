import { createZodDto } from "nestjs-zod";
import { createSaleSchema } from "@kosh/validation";
import { InputType, Field } from "@nestjs/graphql";
import { PaymentType } from "@kosh/db";
import { CreateSaleItemInput } from "./CreateSaleItemDto.dto";

@InputType()
export class CreateSaleInput extends createZodDto(createSaleSchema) {
	@Field(() => String)
	storeId: string;

	@Field(() => Number)
	discount: number;

	@Field(() => PaymentType)
	paymentType: PaymentType;

	@Field(() => String, { nullable: true })
	creditId?: string;

	@Field(() => [CreateSaleItemInput])
	items: CreateSaleItemInput[];

	@Field(() => String, { nullable: true })
	transactionNote?: string;

	@Field(() => String, { nullable: true })
	customerName?: string;

	@Field(() => String, { nullable: true })
	customerEmail?: string;

	@Field(() => String, { nullable: true })
	customerContact?: string;
}
