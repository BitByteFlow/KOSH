import { Field, ObjectType, ID } from '@nestjs/graphql';
import { ProductVariant } from './productVariant.entity';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  productName: string;

  @Field(() => ID)
  category: string;

  @Field()
  totalStock: number

  @Field()
  variantCount: number

  @Field()
  status: string;

  @Field(() => [ProductVariant])
  variants: ProductVariant[];

}
