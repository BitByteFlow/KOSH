import { Prisma } from '@kosh/db';
import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { ProductVariant } from '../../product/entities/productVariant.entity';

@ObjectType()
export class PurchaseItem {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  price: Prisma.Decimal;

  @Field(() => ID)
  variantId: string;

  @Field(() => ProductVariant)
  variant: ProductVariant;
}
