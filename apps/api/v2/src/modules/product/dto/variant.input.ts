import { createZodDto } from 'nestjs-zod';
import { variantDtoSchema } from '@kosh/validation';
import { InputType, Field } from '@nestjs/graphql';
import { AttributeInput } from './attribute.input';

@InputType()
export class VariantInput extends createZodDto(variantDtoSchema) {

  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Number)
  costPrice: number;

  @Field(() => Number)
  sellingPrice: number;

  @Field(() => Number, { defaultValue: 0 })
  stock: number;

  @Field(() => [AttributeInput], { nullable: true })
  attributes?: AttributeInput[];
}
