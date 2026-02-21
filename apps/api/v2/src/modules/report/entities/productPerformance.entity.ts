import { Field, Int, ObjectType, InputType, Float } from "@nestjs/graphql";

@ObjectType()
export class ProductPerformance {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field()
	sku: string;

	@Field()
	category: string;

	@Field(() => Int)
	sold: number;

	@Field(() => Float)
	revenue: number;

	@Field(() => Float)
	margin: number;

	@Field()
	status: string;
}

@InputType()
export class ProductPerformanceFilter {
	@Field({ nullable: true })
	startDate?: string;

	@Field({ nullable: true })
	endDate?: string;

	@Field(() => [String], { nullable: true })
	categories?: string[];

	@Field(() => [String], { nullable: true })
	statuses?: string[];

	@Field(() => Int, { nullable: true })
	minSold?: number;

	@Field(() => Int, { nullable: true })
	maxSold?: number;

	@Field({ nullable: true })
	searchQuery?: string;

	@Field(() => Int, { defaultValue: 0 })
	skip: number;

	@Field(() => Int, { defaultValue: 10 })
	take: number;
}

@ObjectType()
export class ProductPerformanceResult {
	@Field(() => [ProductPerformance])
	items: ProductPerformance[];

	@Field(() => Int)
	totalCount: number;
}
