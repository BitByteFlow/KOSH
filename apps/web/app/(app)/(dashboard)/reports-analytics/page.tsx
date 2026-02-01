"use client";

import { useState } from "react";
import { AnalyticsMetricCard } from "@/components/reports/AnalyticsMetric";
import { SalesTrendChart } from "@/components/reports/SalesTrendChart";
import { TopProductsChart } from "@/components/reports/TopProductsChart";
import { ReportTabs } from "@/components/reports/ReportTabs";
import { AnalyticsTransactionTable } from "@/components/reports/AnalyticsTransaction";
import { SalesReportTable } from "@/components/reports/SalesReportTable";
import { ProductPerformanceTable } from "@/components/reports/ProductPerformanceTable";
import { InventoryReportTable } from "@/components/reports/InventoryReportTable";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { salesTrendData, topProducts, transactions } from "@/data/mockData";
import { analyticsMetricValues } from "@/data/mockData";

export default function AnalyticsPage() {
	const [activeReport, setActiveReport] = useState("Sales Report");

	const handleReportChange = (report: string) => {
		setActiveReport(report);
	};

	return (
		<main className="flex-1 space-y-6 p-8">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-foreground">
					Reports & Analytics
				</h2>
				<DateRangeSelector onRangeChange={() => { }} />
			</div>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				{analyticsMetricValues.map((metric) => (
					<AnalyticsMetricCard
						key={metric.label}
						label={metric.label}
						value={metric.value}
						trend={metric.trend}
						trendLabel={metric.trendLabel}
						isPositive={metric.isPositive}
						subtitle={metric.subtitle}
					/>
				))}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<SalesTrendChart data={salesTrendData} />
				</div>
				<TopProductsChart data={topProducts} />
			</div>

			<div className="space-y-6 rounded-lg shadow-md border border-border bg-card p-6">
				<ReportTabs
					tabs={[
						"Sales Report",
						"Product Performance",
						"Inventory Report",
						"Cash Report",
					]}
					onTabChange={handleReportChange}
				/>

				<div className="mt-6">
					{activeReport === "Sales Report" && <SalesReportTable />}
					{activeReport === "Product Performance" && <ProductPerformanceTable />}
					{activeReport === "Inventory Report" && <InventoryReportTable />}
					{activeReport === "Cash Report" && <AnalyticsTransactionTable transactions={transactions} />}
				</div>
			</div>
		</main>
	);
}
