import { type ReactNode } from "react";

interface SettingsSectionProps {
	title: string;
	description?: string;
	children: ReactNode;
}

export function SettingsSection({
	title,
	description,
	children,
}: SettingsSectionProps) {
	return (
		<div className="py-8 border-b border-border last:border-b-0">
			<div className="mb-6">
				<h2 className="text-lg font-semibold text-foreground">{title}</h2>
				{description && (
					<p className="text-sm text-muted-foreground mt-1">{description}</p>
				)}
			</div>
			<div>{children}</div>
		</div>
	);
}
