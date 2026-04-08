import { Field, ObjectType, ID, Float } from "@nestjs/graphql";

@ObjectType()
export class AccountTransaction {
	@Field(() => ID)
	id!: string;

	@Field(() => String)
	type!: string;

	@Field(() => Float)
	amount!: number;

	@Field(() => String, { nullable: true })
	note?: string;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}
