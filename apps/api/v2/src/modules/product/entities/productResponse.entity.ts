import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Product } from './product.entity';
import { PaginationMeta } from 'src/modules/accounts/entities/paginatedTransactions.entity';

@ObjectType()
export class ProductResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field()
  message: string;

  @Field(() => Product, { nullable: true })
  data?: Product[];

  @Field(() => PaginationMeta, { nullable: true })
  meta?: PaginationMeta;
}

@ObjectType()
export class ProductsResponse {
  @Field(() => [Product])
  products: Product[];

  @Field(() => Int)
  count: number;
}
