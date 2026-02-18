import { createZodDto } from 'nestjs-zod';
import { variantDtoSchema } from '@kosh/validation';
import { InputType, Field, Float } from '@nestjs/graphql';
import { AttributeInput } from './attribute.input';

@InputType()
export class VariantInput extends createZodDto(variantDtoSchema) {

  @Field(() => String, { nullable: true })
  id?: string;

  @Field(() => Float)
  costPrice: number;

  @Field(() => Float)
  sellingPrice: number;

  @Field(() => Number, { defaultValue: 0 })
  stock: number;

  @Field(() => [AttributeInput], { nullable: true })
  attributes?: AttributeInput[];
}
