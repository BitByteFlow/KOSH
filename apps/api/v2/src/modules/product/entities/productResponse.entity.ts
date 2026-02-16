import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Product } from './product.entity';

@ObjectType()
export class ProductResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field()
  message: string;

  @Field(() => Product, { nullable: true })
  product?: Product;
}

@ObjectType()
export class ProductsResponse {
  @Field(() => [Product])
  products: Product[];

  @Field(() => Int)
  count: number;
}
