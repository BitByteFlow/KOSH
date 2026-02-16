import { Field, ObjectType, ID } from '@nestjs/graphql';
import { ProductVariant } from './product-variant.entity';

@ObjectType()
export class Product {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ID)
  categoryId: string;

  @Field({ nullable: true })
  supplierName?: string;

  @Field()
  keepPurchaseRecord: boolean;

  @Field(() => [ProductVariant])
  variants: ProductVariant[];

  @Field({ nullable: true })
  deletedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
