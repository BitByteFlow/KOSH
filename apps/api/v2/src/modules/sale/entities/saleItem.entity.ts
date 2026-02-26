import { Prisma } from '@kosh/db';
import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class SaleItem {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  sellPrice: number;

  @Field(() => Float)
  costPrice: number;

  @Field(() => ID)
  variantId: string;
}
