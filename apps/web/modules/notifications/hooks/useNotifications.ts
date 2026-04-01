import { useMutation, useQuery } from "@apollo/client/react";
import {
	notificationsService,
	GET_NOTIFICATIONS,
	MARK_ALL_AS_READ,
	NOTIFICATION_SUBSCRIPTION,
	NotificationsResponse,
	Notification,
} from "../../../services/notifications.service";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface NotificationAddedSubscriptionData {
	notificationAdded: Notification;
}

export const useNotifications = () => {
	const { data: session, status } = useSession();
	const isAuthenticated = status === "authenticated" && !!session?.user?.token;

	const result = useQuery<{ notifications: NotificationsResponse }>(
		GET_NOTIFICATIONS,
		{
			skip: !isAuthenticated,
			fetchPolicy: "cache-and-network",
			errorPolicy: "ignore",
		},
	);

	const { subscribeToMore } = result;

	useEffect(() => {
		if (status === "loading" || !isAuthenticated) return;

		const unsubscribe = subscribeToMore<NotificationAddedSubscriptionData>({
			document: NOTIFICATION_SUBSCRIPTION,
			onError: () => {
				// Completely suppress all subscription errors
			},
			updateQuery: (
				prev,
				{ subscriptionData },
			): { notifications: NotificationsResponse } => {
				if (!subscriptionData.data)
					return prev as { notifications: NotificationsResponse };
				const newNotification = subscriptionData.data.notificationAdded;

				const notifications = prev.notifications as
					| NotificationsResponse
					| undefined;
				if (!notifications)
					return prev as { notifications: NotificationsResponse };

				const currentData = notifications.data || [];

				// Check if notification already exists to avoid duplicates
				if (
					currentData.some((n: Notification) => n.id === newNotification.id)
				) {
					return prev as { notifications: NotificationsResponse };
				}

				return {
					notifications: {
						...notifications,
						success: notifications.success ?? true,
						message: notifications.message ?? "New notifications",
						data: [newNotification, ...currentData],
					},
				};
			},
		});

		return () => {
			unsubscribe();
		};
	}, [subscribeToMore, isAuthenticated, status]);

	return result;
};

export const useMarkAllNotificationsAsRead = () => {
	const [mutate, { loading }] = useMutation<{
		markAllNotificationsAsRead: NotificationsResponse;
	}>(MARK_ALL_AS_READ, {
		onCompleted: (data) => {
			// Success handling if needed
		},
		refetchQueries: [GET_NOTIFICATIONS],
	});

	return {
		mutate: () => mutate(),
		loading,
	};
};
