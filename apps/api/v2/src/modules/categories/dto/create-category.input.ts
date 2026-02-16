import { createZodDto } from 'nestjs-zod';
import { createCategorySchema } from '@kosh/validation';
import { InputType } from '@nestjs/graphql';

@InputType()
export class CreateCategoryInput extends createZodDto(createCategorySchema) {}
