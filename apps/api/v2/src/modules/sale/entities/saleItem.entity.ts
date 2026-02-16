import { Prisma } from '@kosh/db';
import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class SaleItem {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  sellPrice: Prisma.Decimal;

  @Field(() => Float)
  costPrice: Prisma.Decimal;

  @Field(() => ID)
  variantId: string;
}
