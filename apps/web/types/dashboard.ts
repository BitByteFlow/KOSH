import type { LucideIcon } from "lucide-react";

export interface MetricCardProps {
	label: string;
	value: string;
	change?: {
		value: number;
		label: string;
		positive: boolean;
	};
	icon?: LucideIcon;
	sublabel?: string;
	iconColor?: string;
}
