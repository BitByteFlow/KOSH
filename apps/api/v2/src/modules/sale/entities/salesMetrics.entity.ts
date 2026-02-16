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
