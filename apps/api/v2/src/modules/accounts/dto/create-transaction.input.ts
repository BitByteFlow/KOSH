import { createZodDto } from 'nestjs-zod';
import { createTransactionSchema } from '@kosh/validation';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateTransactionInput extends createZodDto(createTransactionSchema) {}
