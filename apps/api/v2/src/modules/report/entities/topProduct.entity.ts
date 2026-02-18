import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class TopProduct {
	@Field(() => String)
	name: string;

	@Field(() => String)
	revenue: string;

	@Field(() => Float)
	value: number;
}
