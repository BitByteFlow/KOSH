import { Field, ObjectType, ID, Float, registerEnumType, Int } from '@nestjs/graphql';
import { SaleItem } from './saleItem.entity';
import { Prisma, PaymentType } from '@kosh/db';

registerEnumType(PaymentType, {
  name: 'PaymentType',
  description: 'Payment type enumeration',
});

@ObjectType()
export class Sale {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  total: number;

  @Field(() => Float)
  discount: number;

  @Field(() => Float)
  profit: number;

  @Field(() => PaymentType)
  paymentType: PaymentType;

  @Field(() => [SaleItem])
  items: SaleItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field({ nullable: true })
  deletedAt?: Date;
}


@ObjectType()
export class SaleResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  @Field(() => [Sale], { nullable: true })
  data?: Sale[];

  @Field(() => Int, { nullable: true })
  totalCount?: number;
}