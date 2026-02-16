import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class Balance {
  @Field(() => Float)
  openingCash: number;

  @Field(() => Float)
  closingCash: number;

  @Field(() => Float)
  totalCashIn: number;

  @Field(() => Float)
  totalCashOut: number;

  @Field(() => Float)
  totalSales: number;

  @Field(() => Float)
  totalExpense: number;
}
