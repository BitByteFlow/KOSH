import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnalyticsMetricCardProps } from "@/types/reports";

export function AnalyticsMetricCard({
	label,
	value,
	trend,
	trendLabel,
	subtitle,
	isPositive = true,
}: AnalyticsMetricCardProps) {
	const trendColor = isPositive ? "text-green-600" : "text-red-600";

	return (
		<div className="rounded-lg shadow-md border border-border bg-card p-4">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm font-medium uppercase text-muted-foreground">
						{label}
					</p>
					<p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
					{subtitle && (
						<p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
					)}
				</div>
				{trend !== undefined && (
					<div className={cn("flex items-center gap-1 text-sm", trendColor)}>
						{isPositive ? (
							<ArrowUp className="h-4 w-4" />
						) : (
							<ArrowDown className="h-4 w-4" />
						)}
						<span className="font-semibold">{trend}%</span>
					</div>
				)}
			</div>
			{trendLabel && (
				<p className="mt-4 text-xs text-muted-foreground">{trendLabel}</p>
			)}
		</div>
	);
}
