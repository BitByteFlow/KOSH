import React from "react";
import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { DollarSign, Files, TrendingUp, Users } from "lucide-react";

const salesMetrics = [
	{
		label: "Total Revenue",
		value: "Rs 45,231",
		change: { value: 12, label: "vs last month", positive: true },
		icon: DollarSign,
	},
	{
		label: "Transactions",
		value: "156",
		sublabel: "Successful sales",
		icon: Files,
	},
	{
		label: "Avg. Sale Value",
		value: "Rs 290",
		change: { value: 4, label: "vs last month", positive: true },
		icon: TrendingUp,
	},
	{
		label: "Active Customers",
		value: "89",
		sublabel: "Returning buyers",
		icon: Users,
	},
];

const SalesMetrices = () => {
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

export default SalesMetrices;
