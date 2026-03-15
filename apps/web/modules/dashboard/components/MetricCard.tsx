import { TrendingUp } from "lucide-react";

import { Card } from "@kosh/ui/components/card";
import type { MetricCardProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function MetricCard({
	label,
	value,
	change,
	// icon: Icon,
	sublabel,
	// iconColor,
}: MetricCardProps) {
	return (
		<Card className="p-5 border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between">
				<div className="space-y-1">
					<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
					<p className="text-xl font-bold text-foreground tabular-nums">{value}</p>
					{sublabel && (
						<p className="text-xs text-muted-foreground font-medium">{sublabel}</p>
					)}
					{change && (
						<div className="flex items-center gap-1.5 mt-2 text-sm">
							<TrendingUp
								className={cn(
									"h-4 w-4",
									change.positive ? "text-success" : "text-destructive",
								)}
							/>
							<span
								className={cn(
									"font-semibold",
									change.positive ? "text-success" : "text-destructive",
								)}
							>
								{change.positive ? "+" : "-"}
								{change.value}%
							</span>
							<span className="text-muted-foreground">{change.label}</span>
						</div>
					)}
				</div>
				{/* <div className={cn(
					"p-3 rounded-xl transition-colors ring-1 ring-border/50 shadow-inner",
					// iconColor === "text-success" ? "bg-success/10" :
						// iconColor === "text-destructive" ? "bg-destructive/10" :
							// iconColor === "text-warning" ? "bg-warning/10" :
								// iconColor === "text-info" ? "bg-info/10" :
									// "bg-muted/50"
				)}>
					<Icon className={cn("w-4 h-4 transition-transform hover:scale-110", iconColor || "text-primary")} />
				</div> */}
			</div>
		</Card>
	);
}
