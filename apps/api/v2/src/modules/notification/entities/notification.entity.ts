import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';

@ObjectType()
export class Notification {
	@Field(() => ID)
	id: string;

	@Field(() => ID)
	userId: string;

	@Field()
	type: string;

	@Field()
	message: string;

	@Field(() => Boolean)
	isRead: boolean;

	@Field(() => GraphQLJSONObject, { nullable: true })
	metadata?: any;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
