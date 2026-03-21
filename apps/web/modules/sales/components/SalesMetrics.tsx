"use client"

import React, { useMemo } from "react";
import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { DollarSign, Files, TrendingUp, Wallet } from "lucide-react";
import { MetricCardSkeleton } from "@/components/MetricCardSkeletion";
import { gql } from "@/gql";
import { useQuery } from "@apollo/client/react";
import { parseGraphQLResponse } from "@/lib/graphql/utils";
import { formatCurrency } from "@/lib/utils";


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
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
			value: formatCurrency(metrics.totalSales),
			change: { value: 0, label: "Today", positive: true },
			icon: DollarSign,
			iconColor: "text-success",
			gradient: "gradient-blue",
		},
		{
			label: "Transactions",
			value: metrics.totalTransactions.toString(),
			sublabel: "Today's sales count",
			icon: Files,
			iconColor: "text-info",
			gradient: "gradient-pink",
		},
		{
			label: "Avg. Sale Value",
			value: formatCurrency(metrics.avgSaleValue),
			change: { value: 0, label: "Today", positive: true },
			icon: TrendingUp,
			iconColor: "text-success",
			gradient: "gradient-orange",
		},
		{
			label: "Total Profit",
			value: formatCurrency(metrics.totalProfit),
			sublabel: "Today's net profit",
			icon: Wallet,
			iconColor: "text-success",
			gradient: "gradient-redish",
		},
	];

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{salesMetrics.map((metric) => (
				<MetricCard
					key={metric.label}
					label={metric.label}
					value={metric.value}
					change={metric.change}
					icon={metric.icon}
					sublabel={metric.sublabel}
					gradient={metric.gradient}
				/>
			))}
		</div>
	);
};

export default SalesMetrics;
