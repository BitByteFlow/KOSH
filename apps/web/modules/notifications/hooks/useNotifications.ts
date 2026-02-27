import { useMutation, useQuery } from "@apollo/client/react";
import {
	notificationsService,
	GET_NOTIFICATIONS,
	MARK_ALL_AS_READ,
	NotificationsResponse
} from "../../../services/notifications.service";

export const useNotifications = () => {
	return useQuery<{ notifications: NotificationsResponse }>(GET_NOTIFICATIONS, {
		pollInterval: 30000, // Poll every 30 seconds
	});
};

export const useMarkAllNotificationsAsRead = () => {
	const [mutate, { loading }] = useMutation<{ markAllNotificationsAsRead: NotificationsResponse }>(
		MARK_ALL_AS_READ,
		{
			onCompleted: (data) => {
				// Success handling if needed
			},
			refetchQueries: [GET_NOTIFICATIONS],
		}
	);

	return {
		mutate: () => mutate(),
		loading,
	};
};
