import { TrendingUp } from "lucide-react";

import { Card } from "@kosh/ui/components/card";
import { MetricCardProps } from "@/types/dashboard";
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
	const colors =
		colorMap[label] ||
		({
			bg: "bg-muted",
			text: "text-muted-foreground",
		} as (typeof colorMap)[string]);
	return (
		<Card className="p-4 border border-border rounded-lg shadow-sm">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm font-medium text-muted-foreground">{label}</p>
					<p className="text-2xl font-bold mt-1 text-foreground">Rs. {value}</p>
					{sublabel && (
						<p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
					)}
					{change && (
						<div className="flex items-center gap-1 mt-2 text-sm">
							<TrendingUp
								className={cn(
									"h-4 w-4",
									change.positive ? "text-green-500" : "text-red-500",
								)}
							/>
							<span
								className={cn(
									"font-medium",
									change.positive ? "text-green-500" : "text-red-500",
								)}
							>
								{change.positive ? "+" : "-"}
								{change.value}%
							</span>
							<span className="text-muted-foreground">{change.label}</span>
						</div>
					)}
				</div>
				<div className={cn("p-3 rounded-lg", colors.bg)}>
					<Icon className={cn("w-5 h-5", iconColor || colors.text)} />
				</div>
			</div>
		</Card>
	);
}
