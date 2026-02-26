import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { notificationsService } from "../../../services/notifications.service";

export const useNotifications = () => {
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useQuery({
		queryKey: ["notifications"],
		queryFn: () => notificationsService.getNotifications(token),
		enabled: !!token,
		refetchInterval: 30000, // Poll every 30 seconds for MVP
	});
};

export const useMarkAllNotificationsAsRead = () => {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: () => notificationsService.markAllAsRead(token),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["notifications"] });
		},
	});
};
