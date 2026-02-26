import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class Settings {
	@Field(() => ID)
	id: string;

	@Field(() => ID)
	userId: string;

	@Field(() => Int)
	lowStockThreshold: number;

	@Field(() => Boolean)
	autoArchive: boolean;

	@Field(() => Boolean)
	emailReports: boolean;

	@Field(() => Boolean)
	pushNotifications: boolean;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;
}
