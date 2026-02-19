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
}

@ObjectType()
export class SaleReport {
	@Field(() => String)
	id: string;

	@Field(() => String)
	date: string;

	@Field(() => String)
	customer: string;

	@Field(() => Int)
	items: number;

	@Field(() => Float)
	total: number;

	@Field(() => PaymentType)
	payment: PaymentType;

	@Field(() => String)
	status: string;
}
