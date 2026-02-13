"use client";

import React from "react";
import { DollarSign, Files, TrendingUp, Wallet } from "lucide-react";
import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { SalesHistoryTable } from "@/modules/sales/components/SalesHistoryTable";
import { CreateSaleSheet } from "@/modules/sales/components/CreateSaleSheet";
import { useSalesMetrics } from "@/modules/sales/hooks/useSales";

export default function SalesPage() {
	const { data: metrics, isLoading } = useSalesMetrics();

	const salesMetrics = [
		{
			label: "Total Revenue",
			value: isLoading ? "..." : `Rs ${metrics?.totalRevenue?.toLocaleString() || 0}`,
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
			value: isLoading ? "..." : `Rs ${Math.round(metrics?.avgSaleValue || 0).toLocaleString()}`,
			change: { value: 0, label: "Today", positive: true },
			icon: TrendingUp,
		},
		{
			label: "Total Profit",
			value: isLoading ? "..." : `Rs ${metrics?.totalProfit?.toLocaleString() || 0}`,
			sublabel: "Today's net profit",
			icon: Wallet,
		},
	];

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
