import { createZodDto } from 'nestjs-zod';
import { createProductSchema } from '@kosh/validation';
import { InputType, Field } from '@nestjs/graphql';
import { VariantInput } from './variant.input';

@InputType()
export class CreateProductInput extends createZodDto(createProductSchema) {

  @Field(() => String)
  categoryId: string;

  @Field(() => String)
  name: string;

  @Field(() => [VariantInput])
  variants: VariantInput[];

  @Field(() => Boolean, { defaultValue: false })
  keepPurchaseRecord: boolean;

  @Field(() => String, { nullable: true })
  supplierName?: string;
}
