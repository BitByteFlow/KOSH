import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class BalanceResponse {
  @Field(() => Boolean)
  success: boolean

  @Field(() => String, { nullable: true })
  message?: string

  @Field(() => Balance, { nullable: true })
  data?: Balance
}

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
