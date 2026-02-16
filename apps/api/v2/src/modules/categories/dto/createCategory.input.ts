import { createZodDto } from 'nestjs-zod';
import { createCategorySchema } from '@kosh/validation';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateCategoryInput extends createZodDto(createCategorySchema) {
	@Field()
	name: string;
}
