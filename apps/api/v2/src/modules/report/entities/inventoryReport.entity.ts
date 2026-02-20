import { Field, Int, ObjectType, InputType, Float } from "@nestjs/graphql";

@ObjectType()
export class InventoryReport {
	@Field()
	id: string;

	@Field()
	name: string;

	@Field()
	sku: string;

	@Field()
	category: string;

	@Field(() => Int)
	stock: number;

	@Field(() => Float)
	value: number;

	@Field()
	status: string;
}

@InputType()
export class InventoryReportFilter {
	@Field(() => [String], { nullable: true })
	categories?: string[];

	@Field(() => [String], { nullable: true })
	statuses?: string[];

	@Field(() => Int, { nullable: true })
	minStock?: number;

	@Field(() => Int, { nullable: true })
	maxStock?: number;

	@Field({ nullable: true })
	searchQuery?: string;

	@Field(() => Int, { defaultValue: 0 })
	skip: number;

	@Field(() => Int, { defaultValue: 10 })
	take: number;
}

@ObjectType()
export class InventoryReportResult {
	@Field(() => Boolean)
	success: boolean;

	@Field(() => String, { nullable: true })
	message?: string;

	@Field(() => [InventoryReport], { nullable: true })
	data?: InventoryReport[];

	@Field(() => Int, { nullable: true })
	totalCount?: number;
}
