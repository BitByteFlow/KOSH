import { createZodDto } from 'nestjs-zod';
import { createUserSchema } from '@kosh/validation';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput extends createZodDto(createUserSchema) {
	@Field()
  googleId: string;
  @Field()
  email: string;
  @Field()
  image: string;
  @Field()
  username: string;
}
