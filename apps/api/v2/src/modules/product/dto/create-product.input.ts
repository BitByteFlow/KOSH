import { createZodDto } from 'nestjs-zod';
import { createProductSchema } from '@kosh/validation';
import { InputType } from '@nestjs/graphql';

@InputType()
export class CreateProductInput extends createZodDto(createProductSchema) {}
