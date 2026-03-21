import { TrendingUp, TrendingDown } from "lucide-react";

import { Card } from "@kosh/ui/components/card";
import type { MetricCardProps } from "@/types/dashboard";
import { cn } from "@/lib/utils";

export function MetricCard({
	label,
	value,
	change,
	icon: Icon,
	sublabel,
	iconColor,
	gradient,
}: MetricCardProps) {
	const hasGradient = !!gradient;

	let primaryTextColor = "text-foreground";
	let secondaryTextColor = "text-muted-foreground";
	let iconWrapperClassName = "bg-muted text-foreground";
	let positiveTrendColor = "text-success bg-success/10 border-success/20";
	let negativeTrendColor = "text-destructive bg-destructive/10 border-destructive/20";

	if (gradient === "gradient-blue") {
		primaryTextColor = "text-white";
		secondaryTextColor = "text-blue-100";
		iconWrapperClassName = "bg-white/20 text-white backdrop-blur-md shadow-inner ring-1 ring-white/20";
		positiveTrendColor = "text-emerald-100 bg-white/20 ring-1 ring-white/20";
		negativeTrendColor = "text-rose-100 bg-white/20 ring-1 ring-white/20";
	} else if (gradient === "gradient-redish") {
		primaryTextColor = "text-black";
		secondaryTextColor = "text-black";
		iconWrapperClassName = "";
		positiveTrendColor = "text-emerald-800 bg-white/60 ring-1 ring-black/5";
		negativeTrendColor = "text-rose-800 bg-white/60 ring-1 ring-black/5";
	} else if (gradient === "gradient-pink") {
		primaryTextColor = "text-black";
		secondaryTextColor = "text-black";
		iconWrapperClassName = "";
		positiveTrendColor = "text-emerald-800 bg-white/60 ring-1 ring-black/5";
		negativeTrendColor = "text-rose-800 bg-white/60 ring-1 ring-black/5";
	} else if (gradient === "gradient-orange") {
		primaryTextColor = "text-black";
		secondaryTextColor = "text-black";
		iconWrapperClassName = "";
		positiveTrendColor = "text-emerald-800 bg-white/60 ring-1 ring-black/5";
		negativeTrendColor = "text-rose-800 bg-white/60 ring-1 ring-black/5";
	}

	const cardClassName = cn(
		"relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
		!hasGradient ? "bg-card border border-border shadow-sm" : "border-0 shadow-md",
		gradient,
		hasGradient && "before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:pointer-events-none"
	);

	const TrendIcon = change?.positive ? TrendingUp : TrendingDown;

	return (
		<Card className={cardClassName}>
			{hasGradient && (
				<div className="absolute inset-0 z-0 rounded-2xl border border-white/20 pointer-events-none mix-blend-overlay" />
			)}

			<div className="relative z-10 flex flex-col gap-y-4">
				<div className="flex items-start justify-between">
					<p className={cn("text-xl font-medium tracking-tighter mt-1", secondaryTextColor)}>
						{label}
					</p>
					<div className="transition-transform hover:scale-110">
						{Icon && (
							<div className={cn("flex h-12 w-12 items-center justify-center rounded-full", iconWrapperClassName)}>
								<Icon className={cn("h-6 w-6", iconColor)} />
							</div>
						)}
					</div>
				</div>

				<div>
					<h3 className={cn("text-2xl lg:text-3xl font-bold tracking-tighter tabular-nums", primaryTextColor)}>
						{value}
					</h3>
				</div>

				{(sublabel || change) && (
					<div className="mt-1 flex flex-col gap-2">
						{change && (
							<div className="flex items-center gap-2">
								<div className={cn("flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md", change.positive ? positiveTrendColor : negativeTrendColor)}>
									<TrendIcon className="h-5 w-5" strokeWidth={2.5} />
									<span>{change.value}%</span>
								</div>
								<span className={cn("text-xs font-medium", secondaryTextColor)}>
									{change.label}
								</span>
							</div>
						)}
						{sublabel && (
							<span className={cn("text-lg font-medium", secondaryTextColor)}>
								{sublabel}
							</span>
						)}
					</div>
				)}
			</div>
		</Card>
	);
}
