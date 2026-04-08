import { Field, InputType, Float } from "@nestjs/graphql";

@InputType()
export class UpdateTransactionInput {
	@Field(() => String, { nullable: true })
	type?: string;

	@Field(() => Float, { nullable: true })
	amount?: number;

	@Field(() => String, { nullable: true })
	note?: string;
}