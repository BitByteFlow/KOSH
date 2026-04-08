import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { NotificationType } from '@kosh/db';

registerEnumType(NotificationType, {
	name: 'NotificationType',
});

@ObjectType()
export class Notification {
	@Field(() => ID)
	id!: string;

	@Field(() => ID, { nullable: true })
	userId?: string | null;

	@Field(() => NotificationType)
	type!: NotificationType;

	@Field()
	message!: string;

	@Field(() => Boolean)
	isRead!: boolean;

	@Field(() => String, { nullable: true })
	variantId?: string | null;

	@Field(() => Boolean)
	isGlobal!: boolean;

	@Field()
	createdAt!: Date;

	@Field()
	updatedAt!: Date;
}
