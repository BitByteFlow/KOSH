import { Resolver, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationResponse } from './entities/notificationResponse.entity';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';

@Resolver()
@UseGuards(JwtAuthGuard)
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) { }

	@Query(() => NotificationResponse)
	async notifications(@CurrentUser() user: AuthenticatedUser): Promise<NotificationResponse> {
		return this.notificationService.getNotifications(user.id);
	}

	@Mutation(() => NotificationResponse)
	async markAllNotificationsAsRead(@CurrentUser() user: AuthenticatedUser): Promise<NotificationResponse> {
		return this.notificationService.markAllAsRead(user.id);
	}
}
