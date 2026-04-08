import { createZodDto } from 'nestjs-zod';
import { createPurchaseSchema, payPurchaseDebtSchema, purchaseVariantItemSchema } from '@kosh/validation';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PurchaseVariantItem extends createZodDto(purchaseVariantItemSchema){
  @Field(() => String)
  variantId!: string;
  @Field(() => Number)
  quantity!: number;
  @Field(() => Number)
  price!: number;
}

@InputType()
export class CreatePurchaseInput extends createZodDto(createPurchaseSchema) {
  @Field(() => String)
  supplierName!: string;
  @Field(() => String, { nullable: true })
  email?: string;
  @Field(() => String, { nullable: true })
  contact?: string;
  @Field(() => Number)
  amountPaid!: number;
  @Field(() => Date, { nullable: true })
  dueDate?: Date;
  @Field(() => [PurchaseVariantItem], { nullable: true})
  variants!: PurchaseVariantItem[];

}
@InputType()
export class PayPurchaseDebtInput extends createZodDto(payPurchaseDebtSchema) {
  @Field(() => Number)
  amount!: number;
}
