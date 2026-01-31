"use client";

import { useState } from "react";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { StoreInformation } from "@/components/settings/StoreInformation";
import { InventoryConfiguration } from "@/components/settings/InventoryConfiguration";
import { NotificationChannels } from "@/components/settings/NotificationChannels";
import { DangerZone } from "@/components/settings/DangerZone";

export default function SettingsPage() {
	const [activeTab, setActiveTab] = useState("general");

	return (
		<main className="flex-1 overflow-auto">
			<div className="max-w-4xl mx-auto px-6 py-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground">Settings</h1>
					<p className="text-muted-foreground mt-2">
						Manage your store and account preferences.
					</p>
				</div>

				<SettingsTabs
					activeTab={activeTab}
					onTabChange={setActiveTab}
				/>

				<div className="mt-8">
					{activeTab === "general" && (
						<div className="space-y-8">
							<StoreInformation />
							<InventoryConfiguration />
							<NotificationChannels />
							<DangerZone />
						</div>
					)}

					{activeTab === "profile" && (
						<div className="text-center py-16">
							<p className="text-muted-foreground">
								Profile settings coming soon
							</p>
						</div>
					)}

					{activeTab === "notifications" && (
						<div className="text-center py-16">
							<p className="text-muted-foreground">
								Notification settings coming soon
							</p>
						</div>
					)}

					{activeTab === "security" && (
						<div className="text-center py-16">
							<p className="text-muted-foreground">
								Security settings coming soon
							</p>
						</div>
					)}

					{activeTab === "billing" && (
						<div className="text-center py-16">
							<p className="text-muted-foreground">
								Billing settings coming soon
							</p>
						</div>
					)}
				</div>
			</div>
		</main>
	);
}
