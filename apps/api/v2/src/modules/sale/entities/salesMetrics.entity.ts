import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class SalesMetrics {
  @Field(() => Int)
  totalTransactions: number;

  @Field(() => Int)
  totalProfit: number;

  @Field(() => Int)
  totalSales: number;

  @Field(() => Int)
  avgSaleValue: number;
}

@ObjectType()
export class SalesMetricsResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string

  @Field(() => SalesMetrics, { nullable: true })
  data?: SalesMetrics
}