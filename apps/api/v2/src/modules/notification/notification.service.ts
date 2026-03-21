import { Injectable, InternalServerErrorException, Inject } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { NotificationType } from "@kosh/db";
import { NotificationResponse } from "./entities/notificationResponse.entity";
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class NotificationService {
	constructor(
		private readonly database: DatabaseService,
		@Inject('PUB_SUB') private readonly pubSub: PubSub
	) { }

	async getNotifications(userId: string): Promise<NotificationResponse> {
		try {
			const notifications = await this.database.prisma.notification.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				take: 50
			});

			return {
				success: true,
				message: "Notifications retrieved successfully",
				data: notifications
			};
		} catch (error) {
			console.error(`Get Notifications Error: ${error.message}`);
			throw new InternalServerErrorException("Failed to fetch notifications");
		}
	}

	async markAllAsRead(userId: string): Promise<NotificationResponse> {
		try {
			await this.database.prisma.notification.updateMany({
				where: { userId, isRead: false },
				data: { isRead: true }
			});

			return {
				success: true,
				message: "All notifications marked as read"
			};
		} catch (error) {
			console.error(`Mark All As Read Error: ${error.message}`);
			throw new InternalServerErrorException("Failed to update notifications");
		}
	}

	async createNotification(userId: string, type: NotificationType, message: string, variantId?: string, isGlobal: boolean = false): Promise<any> {
		const notification = await this.database.prisma.notification.create({
			data: {
				userId,
				type,
				message,
				variantId,
				isGlobal
			}
		});

		this.pubSub.publish('notificationAdded', { notificationAdded: notification });

		return notification;
	}
}
