import { Field, ObjectType, Float, Int } from '@nestjs/graphql';

// @ObjectType()
// export class AnalyticsMetrics {
//   @Field(() => Float)
//   totalSales: number;

//   @Field(() => Float)
//   totalExpense: number;

//   @Field(() => Float)
//   totalProfit: number;

//   @Field(() => Int)
//   salesCount: number;

//   @Field(() => Int)
//   purchaseCount: number;

//   @Field(() => Float, { nullable: true })
//   averageSaleValue?: number;

//   @Field(() => Float, { nullable: true })
//   averagePurchaseValue?: number;
// }


@ObjectType()
export class AnalyticsMetrics {
  @Field(() => String)
	label: string;

  @Field(() => Float)
	value: number;

  @Field(() => Float, { nullable: true })
	trend?: number;

  @Field(() => String, { nullable: true })
	trendLabel?: string;

  @Field(() => Boolean)
	isPositive: boolean;

  @Field(() => String, { nullable: true })
  subtitle?: string;
}
