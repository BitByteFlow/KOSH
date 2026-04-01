"use client";

import React, { useMemo, useState } from "react";
import { MetricCard } from "./MetricCard";
import {
	Wallet,
	DollarSign,
	TrendingUp,
	ShoppingCart,
	TrendingDown,
	ChevronDown,
	ChevronUp,
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
	const [showExtra, setShowExtra] = useState(false);

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
	];

	const extraMetrics: MetricCardProps[] = [
		{
			label: "Cash Out",
			value: formatCurrency(metrics.totalCashOut),
			gradient: "gradient-orange",
			icon: TrendingDown,
			sublabel: "Total outflows",
		},
		{
			label: "Closing Cash",
			value: formatCurrency(metrics.closingCash),
			gradient: "gradient-pink",
			icon: Wallet,
			sublabel: "Cash in hand",
		},
	];

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
				{metricCardValues.map((item) => (
					<MetricCard
						label={item.label}
						value={item.value}
						change={item.change}
						icon={item.icon}
						key={item.label}
						sublabel={item.sublabel}
						gradient={item.gradient}
					/>
				))}
				{showExtra &&
					extraMetrics.map((item) => (
						<div
							key={item.label}
							className="animate-in fade-in slide-in-from-top-2 duration-300"
						>
							<MetricCard
								label={item.label}
								value={item.value}
								change={item.change}
								icon={item.icon}
								sublabel={item.sublabel}
								gradient={item.gradient}
							/>
						</div>
					))}
			</div>
			
			<div className="flex justify-center mt-2">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => setShowExtra(!showExtra)}
					className="text-muted-foreground hover:bg-muted/50 text-xs h-8 px-4 rounded-full transition-all"
				>
					{showExtra ? (
						<>
							Show Less <ChevronUp className="w-3 h-3 ml-1.5" />
						</>
					) : (
						<>
							Show More Details <ChevronDown className="w-3 h-3 ml-1.5" />
						</>
					)}
				</Button>
			</div>
		</div>
	);
};

export default DailyBalanceMetrics;
