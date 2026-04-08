import { Field, ObjectType, Float, Int, InputType, registerEnumType } from '@nestjs/graphql';
import { PaymentType } from '@kosh/db';

registerEnumType(PaymentType, {
	name: 'PaymentType',
});

@InputType()
export class SaleReportFilter {
	@Field(() => String, { nullable: true })
	startDate?: string;

	@Field(() => String, { nullable: true })
	endDate?: string;

	@Field(() => [PaymentType], { nullable: true })
	paymentMethods?: PaymentType[];

	@Field(() => [String], { nullable: true })
	statuses?: string[];

	@Field(() => String, { nullable: true })
	searchQuery?: string;

	@Field(() => Int, { nullable: true, defaultValue: 1 })
	page?: number;

	@Field(() => Int, { nullable: true, defaultValue: 10 })
	limit?: number;
}

@ObjectType()
export class SaleReport {
	@Field(() => String)
	id!: string;

	@Field(() => String)
	date!: string;

	@Field(() => String)
	customer!: string;

	@Field(() => Int)
	items!: number;

	@Field(() => Float)
	total!: number;

	@Field(() => PaymentType)
	payment!: PaymentType;

	@Field(() => String)
	status!: string;
}

@ObjectType()
export class SaleReportMeta {
	@Field(() => Int)
	total!: number;

	@Field(() => Int)
	page!: number;

	@Field(() => Int)
	limit!: number;

	@Field(() => Int)
	totalPages!: number;

	@Field(() => Boolean)
	hasNext!: boolean;

	@Field(() => Boolean)
	hasPrev!: boolean;
}

@ObjectType()
export class SaleReportResponse {
	@Field(() => Boolean)
	success!: true

	@Field(() => String, { nullable: true })
	message?: string

	@Field(() => [SaleReport])
	data!: SaleReport[]

	@Field(() => SaleReportMeta, { nullable: true })
	meta?: SaleReportMeta
}