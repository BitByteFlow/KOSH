import { createZodDto } from 'nestjs-zod';
import { loginRequestSchema } from '@kosh/validation';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class LoginInput extends createZodDto(loginRequestSchema) {
	@Field()
	googleId: string;
	@Field()
	email: string;
}
