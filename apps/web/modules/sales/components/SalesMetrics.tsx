import React from "react";
import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { DollarSign, Files, TrendingUp, Wallet } from "lucide-react";
import { useSalesMetrics } from "../hooks/useSales";
import { MetricCardSkeleton } from "@/components/MetricCardSkeletion";

const SalesMetrics = () => {
	const { data: metrics, isLoading, isPending } = useSalesMetrics();

	if (isPending) {
		return (
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
			</div>
		);
	}

	const salesMetrics = [
		{
			label: "Total Sales",
			value: isLoading
				? "..."
				: `Rs ${metrics?.totalSales?.toLocaleString() || 0}`,
			change: { value: 0, label: "Today", positive: true },
			icon: DollarSign,
		},
		{
			label: "Transactions",
			value: isLoading ? "..." : (metrics?.totalTransactions || 0).toString(),
			sublabel: "Today's sales count",
			icon: Files,
		},
		{
			label: "Avg. Sale Value",
			value: isLoading
				? "..."
				: `Rs ${Math.round(metrics?.avgSaleValue || 0).toLocaleString()}`,
			change: { value: 0, label: "Today", positive: true },
			icon: TrendingUp,
		},
		{
			label: "Total Profit",
			value: isLoading
				? "..."
				: `Rs ${metrics?.totalProfit?.toLocaleString() || 0}`,
			sublabel: "Today's net profit",
			icon: Wallet,
		},
	];
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			{salesMetrics.map((metric) => (
				<MetricCard
					key={metric.label}
					label={metric.label}
					value={metric.value}
					change={metric.change}
					icon={metric.icon}
					sublabel={metric.sublabel}
				/>
			))}
		</div>
	);
};

export default SalesMetrics;
