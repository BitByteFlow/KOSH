import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsMetricCardProps } from "@/types/reports";

export function AnalyticsMetricCard({
	label,
	value,
	trend,
	trendLabel,
	subtitle,
	isPositive = true,
}: AnalyticsMetricCardProps) {
	const trendColor = isPositive ? "text-success" : "text-destructive";

	return (
		<div className="rounded-xl shadow-sm border border-border bg-card p-6 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between">
				<div className="space-y-1">
					<p className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
						{label}
					</p>
					<p className="text-2xl font-bold text-foreground tabular-nums">
						{value.toFixed(2)}
					</p>
					{subtitle && (
						<p className="text-xs text-muted-foreground font-medium">
							{subtitle}
						</p>
					)}
				</div>
				{trend !== undefined && (
					<div
						className={cn(
							"flex items-center gap-1 text-sm px-2 py-0.5 rounded-full bg-muted/50",
							trendColor,
						)}
					>
						{isPositive ? (
							<ArrowUp className="h-3 w-3 stroke-3" />
						) : (
							<ArrowDown className="h-3 w-3 stroke-3" />
						)}
						<span className="font-bold">{trend}%</span>
					</div>
				)}
			</div>
			{trendLabel && (
				<p className="mt-4 text-[11px] text-muted-foreground font-medium flex items-center gap-2">
					<span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
					{trendLabel}
				</p>
			)}
		</div>
	);
}
