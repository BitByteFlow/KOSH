interface SettingsToggleProps {
	label: string;
	description?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}

export function SettingsToggle({
	label,
	description,
	checked,
	onChange,
}: SettingsToggleProps) {
	return (
		<div className="flex items-start justify-between py-4">
			<div className="flex-1">
				<p className="text-sm font-medium text-foreground">{label}</p>
				{description && (
					<p className="text-sm text-muted-foreground mt-1">{description}</p>
				)}
			</div>
			<button
				onClick={() => onChange(!checked)}
				className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full transition-colors ${
					checked ? "bg-primary" : "bg-muted"
				}`}
			>
				<span
					className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
						checked ? "translate-x-5" : "translate-x-0.5"
					}`}
				/>
			</button>
		</div>
	);
}
