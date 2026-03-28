import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { Attribute } from './attribute.entity';
import { Product } from './product.entity';

@ObjectType()
export class ProductVariant {
  @Field(() => ID)
  id: string;

  @Field()
  sku: string;

  @Field()
  barcode: string;

  @Field(() => Float)
  costPrice: number;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  sellingPrice: number;

  @Field(() => Int)
  stock: number;

  @Field(() => [Attribute], { nullable: true })
  attributes?: Attribute[];

  @Field()
  status: string;

  @Field()
  lowStock: boolean;

  @Field(() => Product)
  product: Product;
}
