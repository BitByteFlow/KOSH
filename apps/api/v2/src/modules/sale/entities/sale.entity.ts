import { Field, ObjectType, ID, Float, registerEnumType } from '@nestjs/graphql';
import { SaleItem } from './saleItem.entity';
import { Prisma , PaymentType} from '@kosh/db';

registerEnumType(PaymentType, {
  name: 'PaymentType',
  description: 'Payment type enumeration',
});

@ObjectType()
export class Sale {
  @Field(() => ID)
  id: string;

  @Field(() => Float)
  total: Prisma.Decimal;

  @Field(() => Float)
  discount: Prisma.Decimal;

  @Field(() => Float)
  profit: Prisma.Decimal;

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
