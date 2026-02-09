import type { ReactNode } from "react";

interface SettingsTabsProps {
	activeTab: string;
	onTabChange: (tab: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
	const tabs = [
		{ id: "general", label: "General" },
		{ id: "profile", label: "Profile" },
		{ id: "notifications", label: "Notifications" },
		{ id: "security", label: "Security" },
		{ id: "billing", label: "Billing" },
	];

	return (
		<div className="border-b border-border">
			<div className="flex space-x-8">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => onTabChange(tab.id)}
						className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors ${
							activeTab === tab.id
								? "border-primary text-foreground"
								: "border-transparent text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>
		</div>
	);
}
