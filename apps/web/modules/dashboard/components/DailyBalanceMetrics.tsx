"use client";

import React, { useMemo } from "react";
import { MetricCard } from "./MetricCard";
import {
	Wallet,
	DollarSign,
	TrendingUp,
	ShoppingCart,
	TrendingDown,
} from "lucide-react";
import type { MetricCardProps } from "@/types/dashboard";
import { formatCurrency } from "@/lib/utils";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";
import { Button } from "@kosh/ui/components/button";
import { MetricCardSkeleton } from "@/components/MetricCardSkeletion";
import { useQuery } from "@apollo/client/react";
import { gql } from "@/gql";
import { parseGraphQLResponse } from "@/lib/graphql/utils";

const GET_DAILY_METRICS = gql(`
	query GetDailyMetrics {
		getCurrentCashBalance {
				success
				data {
					openingCash
					closingCash
					totalSales
					totalExpense
					totalCashIn
					totalCashOut
				}
			}
	}
`);

const DEFAULT_BALANCE = {
	openingCash: 0,
	closingCash: 0,
	totalSales: 0,
	totalExpense: 0,
	totalCashIn: 0,
	totalCashOut: 0,
};

const DailyBalanceMetrics = () => {
	const { data: rawData, loading, error, refetch } = useQuery(GET_DAILY_METRICS);

	const metricsResponse = useMemo(() =>
		parseGraphQLResponse(rawData?.getCurrentCashBalance, DEFAULT_BALANCE),
		[rawData?.getCurrentCashBalance]
	);

	const metrics = metricsResponse.data || DEFAULT_BALANCE;

	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 border border-red-500 rounded bg-red-50">
				<p className="text-red-700">
					Error: {getUserFriendlyErrorMessage(error)}
				</p>
				<Button
					onClick={() => refetch()}
					className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
				>
					Retry
				</Button>
			</div>
		);
	}

	const metricCardValues: MetricCardProps[] = [
		{
			label: "Opening Cash",
			value: formatCurrency(metrics.openingCash),
			gradient: "gradient-blue",
			icon: Wallet,
			sublabel: "Start of day",
			// iconColor: "text-info",
		},
		{
			label: "Sales Today",
			value: formatCurrency(metrics.totalSales),
			gradient: "gradient-pink",
			icon: DollarSign,
			// iconColor: "text-success",
			sublabel: "Total sales",
		},
		{
			label: "Cash In",
			value: formatCurrency(metrics.totalCashIn),
			gradient: "gradient-redish",
			icon: TrendingUp,
			sublabel: "Total inflows",
			// iconColor: "text-success",
		},
		{
			label: "Total Expenses",
			value: formatCurrency(metrics.totalExpense),
			gradient: "gradient-orange",
			icon: ShoppingCart,
			// iconColor: "text-destructive",
			sublabel: "Total expenses",
		},
		// {
		// 	label: "Cash Out",
		// 	value: formatCurrency(metrics.totalCashOut),
		// 	gradient: "gradient-orange",
		// 	icon: TrendingDown,
		// 	sublabel: "Total outflows",
		// 	// iconColor: "text-destructive",
		// },
		// {
		// 	label: "Closing Cash",
		// 	value: formatCurrency(metrics.closingCash),
		// 	gradient: "gradient-pink",
		// 	icon: Wallet,
		// 	sublabel: "Cash in hand",
		// 	// iconColor: "text-info",
		// },
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
			{metricCardValues.map((item) => (
				<MetricCard
					label={item.label}
					value={item.value}
					change={item.change}
					icon={item.icon}
					key={item.label}
					sublabel={item.sublabel}
					// iconColor={item.iconColor}
					gradient={item.gradient}
				/>
			))}
		</div>
	);
};

export default DailyBalanceMetrics;
