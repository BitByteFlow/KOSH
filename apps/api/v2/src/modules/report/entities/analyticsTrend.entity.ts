import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class AnalyticsTrend {
	@Field(() => String)
	label!: string;

	@Field(() => Float)
	value!: number;
}


@ObjectType()
export class AnalyticsTrendResponse {
	@Field(() => Boolean)
	success!: boolean

	@Field(() => String, { nullable: true })
	message?: string

	@Field(() => [AnalyticsTrend], { nullable: true })
	data?: AnalyticsTrend[]
}