import { useState } from "react";
import { SettingsSection } from "./SettingSection";
import { SettingsToggle } from "./SettingsToggle";
import { FormField } from "./FormField";

interface InventoryConfigProps {
	initialData?: {
		lowStockThreshold: number;
		autoArchive: boolean;
		allowBackorders: boolean;
	};
}

export function InventoryConfiguration({ initialData }: InventoryConfigProps) {
	const [config, setConfig] = useState(
		initialData || {
			lowStockThreshold: 10,
			autoArchive: false,
			allowBackorders: true,
		},
	);

	const handleThresholdChange = (value: string) => {
		setConfig((prev) => ({ ...prev, lowStockThreshold: parseInt(value) || 0 }));
	};

	const handleToggle = (field: keyof typeof config, value: boolean) => {
		setConfig((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<SettingsSection
			title="Inventory Configuration"
			description="Manage how the system handles stock alerts and products."
		>
			<div className="space-y-6 p-4 bg-background rounded-lg border border-border">
				<FormField
					label="Low Stock Threshold"
					description="Receive notifications when stock levels fall below this number."
				>
					<div className="flex items-center gap-3">
						<input
							type="number"
							value={config.lowStockThreshold}
							onChange={(e) => handleThresholdChange(e.target.value)}
							className="w-20 px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
						/>
						<span className="text-sm text-muted-foreground">Items</span>
					</div>
				</FormField>

				<div className="border-t border-border pt-6">
					<SettingsToggle
						label="Auto-archive Products"
						description="Automatically hide products from catalog when inventory reaches zero."
						checked={config.autoArchive}
						onChange={(value) => handleToggle("autoArchive", value)}
					/>
				</div>
			</div>
		</SettingsSection>
	);
}
