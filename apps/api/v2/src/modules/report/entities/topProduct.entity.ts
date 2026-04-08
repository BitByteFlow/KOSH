import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class TopProduct {
	@Field(() => String)
	name!: string;

	@Field(() => String)
	revenue!: string;

	@Field(() => Float)
	value!: number;
}


@ObjectType()
export class TopProductResponse {
	@Field(() => Boolean)
	success!: boolean

	@Field(() => String, { nullable: true })
	message?: string

	@Field(() => [TopProduct], { nullable: true })
	data?: TopProduct[]

	@Field(() => Float, { nullable: true })
	totalCount?: number;
}