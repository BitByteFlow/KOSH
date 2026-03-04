import { Field, InputType, Float } from "@nestjs/graphql";

@InputType()
export class UpdateTransactionInput {
	@Field({ nullable: true })
	type?: string;

	@Field(() => Float, { nullable: true })
	amount?: number;

	@Field(() => String, { nullable: true })
	note?: string;
}