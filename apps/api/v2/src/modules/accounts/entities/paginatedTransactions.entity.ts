import { Field, ObjectType, Int } from '@nestjs/graphql';
import { AccountTransaction } from './transaction.entity';

@ObjectType()
export class PaginationMeta {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Int)
  totalPages: number;

  @Field()
  hasNext: boolean;

  @Field()
  hasPrev: boolean;
}

@ObjectType()
export class PaginatedTransactions {
  @Field(() => [AccountTransaction])
  data: AccountTransaction[];

  @Field(() => PaginationMeta)
  meta: PaginationMeta;
}
