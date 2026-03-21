import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class TopProduct {
	@Field(() => String)
	name: string;

	@Field(() => String)
	revenue: string;
}


@ObjectType()
export class TopProductResponse {
	@Field(() => Boolean)
	success: boolean

	@Field(() => String, { nullable: true })
	message?: string

	@Field(() => [TopProduct], { nullable: true })
	data?: TopProduct[]
}