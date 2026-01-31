import { useState } from "react";

interface ReportTabsProps {
	tabs: string[];
	onTabChange: (tab: string) => void;
}

export function ReportTabs({ tabs, onTabChange }: ReportTabsProps) {
	const [activeTab, setActiveTab] = useState(tabs[0]);

	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
		onTabChange(tab);
	};

	return (
		<div className="border-b border-border">
			<div className="flex gap-8">
				{tabs.map((tab) => (
					<button
						key={tab}
						onClick={() => handleTabClick(tab)}
						className={`pb-4 text-sm font-medium transition-colors ${
							activeTab === tab
								? "border-b-2 border-primary text-primary"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{tab}
					</button>
				))}
			</div>
		</div>
	);
}
