import { Field, Int, ObjectType, InputType, Float } from "@nestjs/graphql";

@ObjectType()
export class AnalyticsTransaction {
	@Field()
	id!: string;

	@Field()
	date!: string;

	@Field()
	time!: string;

	@Field()
	paymentType!: string;

	@Field(() => Float)
	amount!: number;

	@Field(() => Float)
	profit!: number;

	@Field()
	status!: string;
}

@InputType()
export class AnalyticsTransactionFilter {
	@Field({ nullable: true })
	startDate?: Date;

	@Field({ nullable: true })
	endDate?: Date;

	@Field(() => [String], { nullable: true })
	paymentTypes?: string[];

	@Field({ nullable: true })
	status?: string;

	@Field(() => Float, { nullable: true })
	minAmount?: number;

	@Field(() => Float, { nullable: true })
	maxAmount?: number;

	@Field({ nullable: true })
	searchQuery?: string;

	@Field(() => Int, { defaultValue: 0 })
	skip!: number;

	@Field(() => Int, { defaultValue: 10 })
	take!: number;
}

@ObjectType()
export class AnalyticsTransactionResult {
	@Field(() => Boolean)
	success!: boolean;

	@Field(() => String, { nullable: true })
	message?: string;

	@Field(() => [AnalyticsTransaction], { nullable: true })
	data?: AnalyticsTransaction[];

	@Field(() => Int, { nullable: true })
	totalCount?: number;
}
