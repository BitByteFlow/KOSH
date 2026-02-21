export interface AnalyticsMetricCardProps {
	label: string;
	value: number;
	trend?: number | null;
	trendLabel?: string | null;
	subtitle?: string | null;
	isPositive?: boolean;
}
