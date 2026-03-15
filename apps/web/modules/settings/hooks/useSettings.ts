import { useMutation, useQuery } from "@apollo/client/react";
import {
	settingsService,
	GET_SETTINGS,
	UPDATE_SETTINGS,
	SettingsResponse,
	UpdateSettingsInput
} from "@/services/settings.service";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";

export function useSettings() {
	return useQuery<{ settings: SettingsResponse }>(GET_SETTINGS);
}

export function useUpdateSettings() {
	const [mutate, { loading }] = useMutation<{ updateSettings: SettingsResponse }, { input: UpdateSettingsInput }>(
		UPDATE_SETTINGS,
		{
			onCompleted: (data) => {
				if (data.updateSettings.success) {
					toast.success("Settings updated successfully!");
				} else {
					toast.error(data.updateSettings.message || "Failed to update settings");
				}
			},
			onError: (error) => {
				console.error("[useUpdateSettings] Error:", error);
				const message = getUserFriendlyErrorMessage(error);
				toast.error(message || "Failed to update settings");
			},
			// Invalidate/refetch queries after mutation
			refetchQueries: [GET_SETTINGS]
		}
	);

	return {
		mutate: (input: UpdateSettingsInput) => mutate({ variables: { input } }),
		loading
	};
}
