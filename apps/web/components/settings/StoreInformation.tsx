import { useState } from "react";
import { SettingsSection } from "./SettingSection";
import { FormField } from "./FormField";

interface StoreInfoProps {
	initialData?: {
		storeName: string;
		currency: string;
		timezone: string;
		language: string;
	};
}

export function StoreInformation({ initialData }: StoreInfoProps) {
	const [formData, setFormData] = useState(
		initialData || {
			storeName: "Invento Main Branch",
			currency: "NPR (Rs.)",
			timezone: "Asia/Kathmandu (GMT+05:45)",
			language: "English (US)",
		},
	);

	const handleChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	return (
		<SettingsSection
			title="Store Information"
			description="Configure your store details and regional preferences."
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-background rounded-lg border border-border">
				<FormField label="Store Name">
					<input
						type="text"
						value={formData.storeName}
						onChange={(e) => handleChange("storeName", e.target.value)}
						className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</FormField>

				<FormField label="Currency">
					<select
						value={formData.currency}
						onChange={(e) => handleChange("currency", e.target.value)}
						className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
					>
						<option>NPR (Rs.)</option>
						<option>USD ($)</option>
						<option>EUR (€)</option>
						<option>GBP (£)</option>
					</select>
				</FormField>

				<FormField label="Timezone">
					<select
						value={formData.timezone}
						onChange={(e) => handleChange("timezone", e.target.value)}
						className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
					>
						<option>Asia/Kathmandu (GMT+05:45)</option>
						<option>UTC (GMT+00:00)</option>
						<option>America/New_York (EST)</option>
						<option>Europe/London (GMT)</option>
					</select>
				</FormField>

				<FormField label="Language">
					<select
						value={formData.language}
						onChange={(e) => handleChange("language", e.target.value)}
						className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background"
					>
						<option>English (US)</option>
						<option>English (UK)</option>
						<option>Nepali</option>
						<option>Spanish</option>
					</select>
				</FormField>
			</div>
		</SettingsSection>
	);
}
