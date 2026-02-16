import { createZodDto } from 'nestjs-zod';
import { attributeSchema } from '@kosh/validation';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class AttributeInput extends createZodDto(attributeSchema) {
  @Field(() => String)
  name: string;

  @Field(() => String)
  value: string;
}
