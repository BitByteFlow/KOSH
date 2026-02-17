"use client";

import React from "react";
import { MetricCard } from "./MetricCard";
import { useAccountBalance } from "../hooks/useAccount";
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

const GET_DAILY_METRICS = gql(`
	query GetDailyMetrics {
		getCurrentCashBalance {
				openingCash
				closingCash
				totalSales
				totalExpense
				totalCashIn
				totalCashOut
			}
	}
`)

const DailyBalanceMetrics = () => {
	// const {
	// 	data: metrics,
	// 	error,
	// 	refetch,
	// 	isPending,
	// } = useAccountBalance();

	const { data: metrics, loading, error, refetch } = useQuery(GET_DAILY_METRICS)

	if (loading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
		console.log("this is daily balance error ", error)
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
			value: formatCurrency(metrics?.getCurrentCashBalance?.openingCash || 0),
			icon: Wallet,
			sublabel: "Start of day",
			iconColor: "text-blue-500",
		},
		{
			label: "Sales Today",
			value: formatCurrency(metrics?.getCurrentCashBalance?.totalSales || 0),
			icon: DollarSign,
			iconColor: "text-green-500",
		},
		{
			label: "Cash In",
			value: formatCurrency(metrics?.getCurrentCashBalance?.totalCashIn || 0),
			icon: TrendingUp,
			sublabel: "Total inflows",
			iconColor: "text-emerald-500",
		},
		{
			label: "Total Expenses",
			value: formatCurrency(metrics?.getCurrentCashBalance?.totalExpense || 0),
			icon: ShoppingCart,
			iconColor: "text-orange-500",
		},
		{
			label: "Cash Out",
			value: formatCurrency(metrics?.getCurrentCashBalance?.totalCashOut || 0),
			icon: TrendingDown,
			sublabel: "Total outflows",
			iconColor: "text-red-500",
		},
		{
			label: "Closing Cash",
			value: formatCurrency(metrics?.getCurrentCashBalance?.closingCash || 0),
			icon: Wallet,
			sublabel: "Cash in hand",
			iconColor: "text-purple-500",
		},
	];
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{metricCardValues.map((item) => (
				<MetricCard
					label={item.label}
					value={item.value}
					change={item.change}
					icon={item.icon}
					key={item.label}
					sublabel={item.sublabel}
					iconColor={item.iconColor}
				/>
			))}
		</div>
	);
};

export default DailyBalanceMetrics;
