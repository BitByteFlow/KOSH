import { Field, ObjectType } from '@nestjs/graphql';
import { Notification } from './notification.entity';

@ObjectType()
export class NotificationResponse {
	@Field(() => Boolean)
	success: boolean;

	@Field()
	message: string;

	@Field(() => [Notification], { nullable: true })
	data?: Notification[];
}
