import { gql } from "@apollo/client";
import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    notifications {
      success
      message
      data {
        id
        type
        message
        isRead
        variantId
        isGlobal
        createdAt
      }
    }
  }
`;

export const MARK_ALL_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead {
      success
      message
    }
  }
`;

export const NOTIFICATION_SUBSCRIPTION = gql`
  subscription OnNotificationAdded {
    notificationAdded {
      id
      type
      message
      isRead
      variantId
      isGlobal
      createdAt
    }
  }
`;

export enum NotificationType {
	LOW_STOCK = "LOW_STOCK",
	NEW_FEATURE_ADDED = "NEW_FEATURE_ADDED",
}

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	isRead: boolean;
	variantId?: string;
	isGlobal: boolean;
	createdAt: string;
}

export interface NotificationsResponse {
	success: boolean;
	message: string;
	data?: Notification[];
}

export const notificationsService = {
	getNotifications: async (token: string | undefined): Promise<NotificationsResponse> => {
		const response = await clientApiClient.post<{ data: { notifications: NotificationsResponse } }>(
			API_ENDPOINTS.graphql,
			token,
			{
				query: GET_NOTIFICATIONS.loc?.source.body,
			},
		);
		return response.data.notifications;
	},

	markAllAsRead: async (token: string | undefined): Promise<NotificationsResponse> => {
		const response = await clientApiClient.post<{ data: { markAllNotificationsAsRead: NotificationsResponse } }>(
			API_ENDPOINTS.graphql,
			token,
			{
				query: MARK_ALL_AS_READ.loc?.source.body,
			},
		);
		return response.data.markAllNotificationsAsRead;
	},
};
