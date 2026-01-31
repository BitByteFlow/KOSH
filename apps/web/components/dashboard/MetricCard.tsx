import { type LucideIcon, TrendingUp } from "lucide-react";
import { Card } from "@kosh/ui/components/card";

interface MetricCardProps {
	label: string;
	value: string;
	change?: {
		value: number;
		label: string;
		positive: boolean;
	};
	icon: LucideIcon;
	sublabel?: string;
}

export function MetricCard({
	label,
	value,
	change,
	icon: Icon,
	sublabel,
}: MetricCardProps) {
	return (
		<Card className="p-6 border border-border">
			<div className="flex items-start justify-between">
				<div>
					<p className="text-sm text-muted-foreground">{label}</p>
					<h3 className="text-3xl font-bold mt-2">{value}</h3>
					{sublabel && (
						<p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
					)}
					{change && (
						<div className="flex items-center gap-1 mt-2">
							<TrendingUp
								className={`w-4 h-4 ${change.positive ? "text-green-500" : "text-red-500"}`}
							/>
							<span
								className={`text-xs font-medium ${change.positive ? "text-green-500" : "text-red-500"}`}
							>
								{change.positive ? "+" : "-"}
								{change.value}% {change.label}
							</span>
						</div>
					)}
				</div>
				<div className="p-2 bg-muted rounded-lg">
					<Icon className="w-6 h-6 text-muted-foreground" />
				</div>
			</div>
		</Card>
	);
}
