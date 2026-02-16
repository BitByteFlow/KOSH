import { createZodDto } from 'nestjs-zod';
import { updateProductSchema } from '@kosh/validation';
import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput extends createZodDto(updateProductSchema) {}
