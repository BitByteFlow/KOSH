import { Field, ObjectType, ID, Float, Int } from '@nestjs/graphql';
import { Attribute } from './attribute.entity';

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
  sellPrice: number;

  @Field(() => Int)
  stock: number;

  @Field(() => [Attribute], { nullable: true })
  attributes?: Attribute[];

  @Field()
  status: string;

  @Field()
  lowStock: boolean;

}
