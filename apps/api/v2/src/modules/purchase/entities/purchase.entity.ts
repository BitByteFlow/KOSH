import { Field, ObjectType, ID, Float, registerEnumType, Int } from '@nestjs/graphql';
import { PurchaseItem } from './purchaseItem.entity';
import { Prisma , PaymentStatus} from '@kosh/db';


registerEnumType(PaymentStatus, {
  name: 'PaymentStatus',
  description: 'Payment status enumeration',
});

@ObjectType()
export class Purchase {
  @Field(() => ID)
  id: string;

  @Field()
  supplierName: string;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field(() => String, { nullable: true })
  contact?: string | null;

  @Field(() => Float)
  total: Prisma.Decimal;

  @Field(() => Float)
  amountPaid: Prisma.Decimal;

  @Field(() => Float)
  balanceDue: Prisma.Decimal;

  @Field(() => Date, { nullable: true })
  dueDate?: Date | null;

  @Field(() => PaymentStatus)
  status: PaymentStatus;

  @Field(() => [PurchaseItem])
  items: PurchaseItem[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
