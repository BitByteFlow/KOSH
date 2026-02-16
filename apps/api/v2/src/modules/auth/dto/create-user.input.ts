import { createZodDto } from 'nestjs-zod';
import { createUserSchema } from '@kosh/validation';
import { InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput extends createZodDto(createUserSchema) {}
