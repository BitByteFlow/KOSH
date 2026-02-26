import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { settingsService, type UpdateSettingsInput } from "@/services/settings.service";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";

export const settingsKeys = {
	all: ["settings"] as const,
};

export function useSettings() {
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useQuery({
		queryKey: settingsKeys.all,
		queryFn: () => settingsService.getSettings(token),
		enabled: !!token,
	});
}

export function useUpdateSettings() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: (data: UpdateSettingsInput) =>
			settingsService.updateSettings(data, token),

		onSuccess: (response) => {
			if (response.success) {
				toast.success("Settings updated successfully!");
				queryClient.invalidateQueries({ queryKey: settingsKeys.all });
			} else {
				toast.error(response.message || "Failed to update settings");
			}
		},

		onError: (error) => {
			console.error("[useUpdateSettings] Error:", error);
			const message = getUserFriendlyErrorMessage(error);
			toast.error(message || "Failed to update settings");
		},
	});
}
