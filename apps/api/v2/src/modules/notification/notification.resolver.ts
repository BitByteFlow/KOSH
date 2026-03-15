import { Resolver, Query, Mutation, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { Notification } from './entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationResponse } from './entities/notificationResponse.entity';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class NotificationResolver {
	constructor(
		private readonly notificationService: NotificationService,
		@Inject('PUB_SUB') private readonly pubSub: any
	) { }

	@Query(() => NotificationResponse)
	async notifications(@CurrentUser() user: AuthenticatedUser): Promise<NotificationResponse> {
		return this.notificationService.getNotifications(user.id);
	}

	@Mutation(() => NotificationResponse)
	async markAllNotificationsAsRead(@CurrentUser() user: AuthenticatedUser): Promise<NotificationResponse> {
		return this.notificationService.markAllAsRead(user.id);
	}

	@Subscription(() => Notification, {
		filter: (payload, variables, context) => {
			// Ensure user only receives their own notifications
			return payload.notificationAdded.userId === context.req?.user?.id;
		},
	})
	notificationAdded() {
		return this.pubSub.asyncIterator('notificationAdded');
	}
}
