"use client"

import React from "react";
import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { DollarSign, Files, TrendingUp, Wallet } from "lucide-react";
import { MetricCardSkeleton } from "@/components/MetricCardSkeletion";
import { gql } from "@/gql";
import { useQuery } from "@apollo/client/react";


const GET_SALES_METRICS = gql(`
	query getSalesMetricsData{
		getSalesMetrics {
			totalTransactions
			totalProfit
			totalSales
			avgSaleValue
		}
	}
`)

const SalesMetrics = () => {
	const { data: metrics, loading } = useQuery(GET_SALES_METRICS)

	if (loading) {
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
			value: loading
				? "..."
				: `Rs ${metrics?.getSalesMetrics.totalSales?.toLocaleString() || 0}`,
			change: { value: 0, label: "Today", positive: true },
			icon: DollarSign,
		},
		{
			label: "Transactions",
			value: loading ? "..." : (metrics?.getSalesMetrics.totalTransactions || 0).toString(),
			sublabel: "Today's sales count",
			icon: Files,
		},
		{
			label: "Avg. Sale Value",
			value: loading
				? "..."
				: `Rs ${Math.round(metrics?.getSalesMetrics.avgSaleValue || 0).toLocaleString()}`,
			change: { value: 0, label: "Today", positive: true },
			icon: TrendingUp,
		},
		{
			label: "Total Profit",
			value: loading
				? "..."
				: `Rs ${metrics?.getSalesMetrics.totalProfit?.toLocaleString() || 0}`,
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
