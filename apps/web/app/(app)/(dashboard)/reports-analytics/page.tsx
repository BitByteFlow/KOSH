"use client";

import { useState } from "react";
import { AnalyticsMetricCard } from "@/components/reports/AnalyticsMetric";
import { SalesTrendChart } from "@/components/reports/SalesTrendChar";
import { TopProductsChart } from "@/components/reports/TopProductsChart";
import { ReportTabs } from "@/components/reports/ReportTabs";
import { AnalyticsTransactionTable } from "@/components/reports/AnalyticsTransaction";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";

const salesTrendData = [
	{ week: "Week 1", sales: 100000 },
	{ week: "Week 2", sales: 210000 },
	{ week: "Week 3", sales: 300000 },
	{ week: "Week 4", sales: 350000 },
];

const topProducts = [
	{ name: "Cotton Crew Neck T-Shirt", revenue: "Rs. 45k", value: 45000 },
	{ name: "Slim Fit Denim Jeans", revenue: "Rs. 32k", value: 32000 },
	{ name: "Classic Leather Belt", revenue: "Rs. 18k", value: 18000 },
	{ name: "Summer Floral Shirt", revenue: "Rs. 12k", value: 12000 },
];

const transactions = [
	{
		id: "#TRX-00892",
		date: "Oct 24, 2023",
		time: "10:42 AM",
		paymentType: "Online" as const,
		amount: "Rs. 4,250.00",
		profit: "+Rs. 850.00",
		status: "Completed" as const,
	},
	{
		id: "#TRX-00891",
		date: "Oct 24, 2023",
		time: "09:15 AM",
		paymentType: "Cash" as const,
		amount: "Rs. 1,200.00",
		profit: "+Rs. 240.00",
		status: "Completed" as const,
	},
	{
		id: "#TRX-00890",
		date: "Oct 23, 2023",
		time: "16:20 PM",
		paymentType: "Credit" as const,
		amount: "Rs. 8,500.00",
		profit: "+Rs. 1,800.00",
		status: "Pending" as const,
	},
];

export default function AnalyticsPage() {
	const [activeReport, setActiveReport] = useState("Sales Report");

	const handleReportChange = (report: string) => {
		setActiveReport(report);
	};

	return (
		<main className="flex-1 space-y-6 p-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold text-foreground">
					Reports & Analytics
				</h1>
				<DateRangeSelector onRangeChange={() => {}} />
			</div>

			{/* Metrics Grid */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<AnalyticsMetricCard
					label="TOTAL SALES"
					value="Rs. 4,24,500"
					trend={12.5}
					trendLabel="vs. Rs. 3,77,200 last month"
					isPositive={true}
				/>
				<AnalyticsMetricCard
					label="TOTAL PROFIT"
					value="Rs. 89,450"
					trend={8.2}
					trendLabel="Net profit margin: 21%"
					isPositive={true}
				/>
				<AnalyticsMetricCard
					label="TRANSACTIONS"
					value="342"
					subtitle="Daily Avg: 11.4 sales"
					isPositive={true}
				/>
				<AnalyticsMetricCard
					label="AVG BILL VALUE"
					value="Rs. 1,241"
					trend={-2.1}
					trendLabel="Per transaction"
					isPositive={false}
				/>
			</div>

			{/* Charts Grid */}
			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<SalesTrendChart data={salesTrendData} />
				</div>
				<TopProductsChart data={topProducts} />
			</div>

			{/* Reports Section */}
			<div className="space-y-6 rounded-lg border border-border bg-card p-6">
				<ReportTabs
					tabs={[
						"Sales Report",
						"Product Performance",
						"Inventory Report",
						"Cash Report",
					]}
					onTabChange={handleReportChange}
				/>

				<AnalyticsTransactionTable transactions={transactions} />
			</div>
		</main>
	);
}
