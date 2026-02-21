"use client"

import React, { useMemo } from "react";
import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { DollarSign, Files, TrendingUp, Wallet } from "lucide-react";
import { MetricCardSkeleton } from "@/components/MetricCardSkeletion";
import { gql } from "@/gql";
import { useQuery } from "@apollo/client/react";
import { parseGraphQLResponse } from "@/lib/graphql/utils";


const GET_SALES_METRICS = gql(`
	query getSalesMetricsData{
		getSalesMetrics {
			success
			message
			data {
				totalTransactions
				totalProfit
				totalSales
				avgSaleValue
			}
		}
	}
`)

const DEFAULT_SALES_METRICS = {
	totalTransactions: 0,
	totalProfit: 0,
	totalSales: 0,
	avgSaleValue: 0,
};

const SalesMetrics = () => {
	const { data: rawData, loading } = useQuery(GET_SALES_METRICS)

	const metricsResponse = useMemo(() =>
		parseGraphQLResponse(rawData?.getSalesMetrics, DEFAULT_SALES_METRICS),
		[rawData?.getSalesMetrics]
	);

	const metrics = metricsResponse.data || DEFAULT_SALES_METRICS;

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
			value: `Rs ${metrics.totalSales.toLocaleString()}`,
			change: { value: 0, label: "Today", positive: true },
			icon: DollarSign,
		},
		{
			label: "Transactions",
			value: metrics.totalTransactions.toString(),
			sublabel: "Today's sales count",
			icon: Files,
		},
		{
			label: "Avg. Sale Value",
			value: `Rs ${Math.round(metrics.avgSaleValue).toLocaleString()}`,
			change: { value: 0, label: "Today", positive: true },
			icon: TrendingUp,
		},
		{
			label: "Total Profit",
			value: `Rs ${metrics.totalProfit.toLocaleString()}`,
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
