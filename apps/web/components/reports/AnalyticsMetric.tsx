import { ArrowDown, ArrowUp } from "lucide-react";

interface AnalyticsMetricCardProps {
	label: string;
	value: string;
	trend?: number;
	trendLabel?: string;
	subtitle?: string;
	isPositive?: boolean;
}

export function AnalyticsMetricCard({
	label,
	value,
	trend,
	trendLabel,
	subtitle,
	isPositive = true,
}: AnalyticsMetricCardProps) {
	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">{label}</p>
					<p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
					{subtitle && (
						<p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
					)}
				</div>
				{trend !== undefined && (
					<div
						className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
							isPositive
								? "bg-green-100 text-green-700"
								: "bg-red-100 text-red-700"
						}`}
					>
						{isPositive ? (
							<ArrowUp className="h-4 w-4" />
						) : (
							<ArrowDown className="h-4 w-4" />
						)}
						{trend}%
					</div>
				)}
			</div>
			{trendLabel && (
				<p className="mt-4 text-xs text-muted-foreground">{trendLabel}</p>
			)}
		</div>
	);
}
