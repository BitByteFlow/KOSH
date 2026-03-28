import { Field, ObjectType, Float, Int } from "@nestjs/graphql";

@ObjectType()
export class SalesMetrics {
	@Field(() => Float)
	totalTransactions: number;

	@Field(() => Float)
	totalProfit: number;

	@Field(() => Float)
	totalSales: number;

	@Field(() => Float)
	avgSaleValue: number;
}

@ObjectType()
export class SalesMetricsResponse {
	@Field(() => Boolean)
	success: boolean;

	@Field(() => String, { nullable: true })
	message?: string;

	@Field(() => SalesMetrics, { nullable: true })
	data?: SalesMetrics;
}
