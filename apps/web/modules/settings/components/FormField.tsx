import type { ReactNode } from "react";

interface FormFieldProps {
	label: string;
	description?: string;
	children: ReactNode;
	className?: string;
}

export function FormField({
	label,
	description,
	children,
	className = "",
}: FormFieldProps) {
	return (
		<div className={`flex flex-col space-y-2 ${className}`}>
			<label className="text-sm font-medium text-foreground">{label}</label>
			{description && (
				<p className="text-xs text-muted-foreground">{description}</p>
			)}
			{children}
		</div>
	);
}
