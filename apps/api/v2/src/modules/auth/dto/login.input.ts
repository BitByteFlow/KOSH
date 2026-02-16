import { createZodDto } from 'nestjs-zod';
import { loginRequestSchema } from '@kosh/validation';
import { InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput extends createZodDto(loginRequestSchema) {}
