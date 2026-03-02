import { TrendingUp } from "lucide-react";

import { Card } from "@kosh/ui/components/card";
import type { MetricCardProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const colorMap: { [key: string]: { bg: string; text: string } } = {
	"Sales Today": {
		bg: "bg-green-100 dark:bg-green-900/30",
		text: "text-green-600 dark:text-green-400",
	},
	Orders: {
		bg: "bg-blue-100 dark:bg-blue-900/30",
		text: "text-blue-600 dark:text-blue-400",
	},
	"Cash in Hand": {
		bg: "bg-orange-100 dark:bg-orange-900/30",
		text: "text-orange-600 dark:text-orange-400",
	},
	"Credit Given": {
		bg: "bg-purple-100 dark:bg-purple-900/30",
		text: "text-purple-600 dark:text-purple-400",
	},
};

export function MetricCard({
	label,
	value,
	change,
	icon: Icon,
	sublabel,
	iconColor,
}: MetricCardProps) {
	return (
		<Card className="p-5 border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between">
				<div className="space-y-1">
					<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
					<p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
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
				<div className={cn(
					"p-3 rounded-xl ring-1 ring-border shadow-inner bg-accent/50",
				)}>
					<Icon className={cn("w-6 h-6", iconColor || "text-primary")} />
				</div>
			</div>
		</Card>
	);
}
