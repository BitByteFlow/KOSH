import { createZodDto } from 'nestjs-zod';
import { updateProductSchema } from '@kosh/validation';
import { InputType, Field } from '@nestjs/graphql';
import { VariantInput } from './variant.input';

@InputType()
export class UpdateProductInput extends createZodDto(updateProductSchema) {

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  categoryId?: string;

  @Field(() => [VariantInput], { nullable: true })
  variants?: VariantInput[];
}
