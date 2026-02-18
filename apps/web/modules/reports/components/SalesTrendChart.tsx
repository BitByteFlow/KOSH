"use client";

import { gql } from "@/gql";
import { getDateRange } from "@/lib/date-utils";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface SalesTrendChartProps {
	dateRange: string
}

const GET_SALES_TREND = gql(`
	query getSalesTrend ($startDate: String!, $endDate: String!){
		getSalesTrend (startDate: $startDate, endDate: $endDate) {
			label
			value
		}
	}
`);

export function SalesTrendChart({ dateRange }: SalesTrendChartProps) {

	const { startDate, endDate } = useMemo(
		() => getDateRange(dateRange),
		[dateRange],
	);
	const { data: trendData, loading: trendLoading } = useQuery<{ getSalesTrend: { label: string; value: number }[] }>(GET_SALES_TREND, {
		variables: { startDate, endDate }
	});

	if (trendLoading) {
		return (
			<div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-border bg-card">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	return (
		<div className="rounded-lg shadow-md border border-border bg-card p-6">
			<h3 className="mb-6 text-lg font-semibold text-foreground">
				Sales Trend
			</h3>
			<ResponsiveContainer
				width="100%"
				height={300}
			>
				<AreaChart
					data={trendData?.getSalesTrend}
					margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
				>
					<defs>
						<linearGradient
							id="colorSales"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="#10b981"
								stopOpacity={0.3}
							/>
							<stop
								offset="95%"
								stopColor="#10b981"
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#e5e7eb"
					/>
					<XAxis
						dataKey="label"
						stroke="#9ca3af"
						style={{ fontSize: "12px" }}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => {
							const date = new Date(value);
							return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
						}}
					/>
					<YAxis
						stroke="#9ca3af"
						style={{ fontSize: "12px" }}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => value >= 1000 ? `Rs. ${value / 1000}k` : `Rs. ${value}`}
					/>
					<Tooltip
						labelFormatter={(label) => {
							const date = new Date(label);
							return date.toLocaleDateString("en-US", {
								weekday: 'short',
								year: 'numeric',
								month: 'short',
								day: 'numeric'
							});
						}}
						contentStyle={{
							backgroundColor: "#fff",
							borderColor: "#e5e7eb",
							borderRadius: "8px",
						}}
					/>
					<Area
						type="monotone"
						dataKey="value"
						stroke="#10b981"
						strokeWidth={2}
						fillOpacity={1}
						fill="url(#colorSales)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
