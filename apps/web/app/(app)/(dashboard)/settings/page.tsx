"use client";

import { InventoryConfiguration } from "@/modules/settings/components/InventoryConfiguration";
import { NotificationChannels } from "@/modules/settings/components/NotificationChannels";
import { DangerZone } from "@/modules/settings/components/DangerZone";
import { useSettings } from "@/modules/settings/hooks/useSettings";

export default function SettingsPage() {
	const { data: response, isLoading } = useSettings();
	const settings = response?.data;

	if (isLoading) {
		return (
			<main className="flex-1 overflow-auto flex items-center justify-center">
				<div className="text-muted-foreground animate-pulse">Loading settings...</div>
			</main>
		);
	}

	return (
		<main className="flex-1 overflow-auto">
			<div className="max-w-4xl mx-auto px-6 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">Settings</h1>
					<p className="text-muted-foreground mt-2">
						Manage your store and account preferences.
					</p>
				</div>

				<div className="mt-8">
					<div className="space-y-8">
						<InventoryConfiguration
							initialData={settings ? {
								lowStockThreshold: settings.lowStockThreshold,
								autoArchive: settings.autoArchive
							} : undefined}
						/>
						<NotificationChannels
							initialData={settings ? {
								emailReports: settings.emailReports,
								pushNotifications: settings.pushNotifications
							} : undefined}
						/>
						<DangerZone />
					</div>
				</div>
			</div>
		</main>
	);
}
