"use client";

import React from "react";
import { DollarSign, Files, TrendingUp, Users } from "lucide-react";
import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { SalesHistoryTable } from "@/modules/sales/components/SalesHistoryTable";
import { CreateSaleSheet } from "@/modules/sales/components/CreateSaleSheet";

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

export default function SalesPage() {
	return (
		<div className="flex-1 space-y-8 p-8 pt-6">
			<div className="flex items-center justify-between space-y-2">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Sales Overview</h2>
					<p className="text-muted-foreground">
						Manage your sales, view history, and create new invoices.
					</p>
				</div>
				<div className="flex items-center space-x-2">
					<CreateSaleSheet />
				</div>
			</div>

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

			<div className="flex-1 space-y-4">
				<h3 className="text-lg font-semibold">Recent Sales History</h3>
				<SalesHistoryTable />
			</div>
		</div>
	);
}
