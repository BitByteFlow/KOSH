import { useState, useEffect } from "react";
import { SettingsSection } from "./SettingSection";
import { useUpdateSettings } from "../hooks/useSettings";
import { Button } from "@kosh/ui/components/button";

interface NotificationChannelsProps {
	initialData?: {
		emailReports: boolean;
		pushNotifications: boolean;
	};
}

export function NotificationChannels({
	initialData,
}: NotificationChannelsProps) {
	const { mutate, loading } = useUpdateSettings();
	const [channels, setChannels] = useState(
		initialData || {
			emailReports: true,
			pushNotifications: false,
		},
	);

	useEffect(() => {
		if (initialData) {
			setChannels(initialData);
		}
	}, [initialData]);

	const handleToggle = (field: keyof typeof channels) => {
		setChannels((prev) => ({ ...prev, [field]: !prev[field] }));
	};

	const isDirty = JSON.stringify(channels) !== JSON.stringify(initialData);

	const handleSave = () => {
		if (isDirty) {
			mutate(channels);
		}
	};

	return (
		<SettingsSection
			title="Notification Channels"
			description="Decide where you want to receive your daily reports and alerts."
		>
			<div className="space-y-4 p-4 bg-background rounded-lg border border-border">
				<label className="flex items-start space-x-3 cursor-pointer">
					<input
						type="checkbox"
						checked={channels.emailReports}
						onChange={() => handleToggle("emailReports")}
						className="mt-1 w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary cursor-pointer"
					/>
					<div className="flex-1">
						<p className="text-sm font-medium text-foreground">Email Reports</p>
						<p className="text-sm text-muted-foreground mt-1">
							Get a daily summary of sales sent to your email at 8:00 PM.
						</p>
					</div>
				</label>

				<label className="flex items-start space-x-3 cursor-pointer border-t border-border pt-4">
					<input
						type="checkbox"
						checked={channels.pushNotifications}
						onChange={() => handleToggle("pushNotifications")}
						className="mt-1 w-4 h-4 rounded border-border focus:ring-2 focus:ring-primary cursor-pointer"
					/>
					<div className="flex-1">
						<p className="text-sm font-medium text-foreground">
							Push Notifications
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Receive real-time alerts for high value transactions.
						</p>
					</div>
				</label>

				<div className="flex justify-end pt-4 border-t border-border">
					<Button
						onClick={handleSave}
						disabled={loading || !isDirty}
					>
						{loading ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</div>
		</SettingsSection>
	);
}
