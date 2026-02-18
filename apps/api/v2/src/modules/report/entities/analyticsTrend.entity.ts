import { Field, ObjectType, Float } from '@nestjs/graphql';

@ObjectType()
export class AnalyticsTrend {
	@Field(() => String)
	label: string;

	@Field(() => Float)
	value: number;
}
