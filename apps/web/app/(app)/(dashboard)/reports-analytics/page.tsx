"use client";

import { useState } from "react";
import { SalesTrendChart } from "@/modules/reports/components/SalesTrendChart";
import { TopProductsChart } from "@/modules/reports/components/TopProductsChart";
import { ReportTabs } from "@/modules/reports/components/ReportTabs";
import { AnalyticsTransactionTable } from "@/modules/reports/components/AnalyticsTransaction";
import { SalesReportTable } from "@/modules/reports/components/SalesReportTable";
import { ProductPerformanceTable } from "@/modules/reports/components/ProductPerformanceTable";
import { InventoryReportTable } from "@/modules/reports/components/InventoryReportTable";
import { DateRangeSelector } from "@/modules/reports/components/DateRangeSelector";
import { salesTrendData, topProducts, transactions } from "@/data/mockData";
import ReportMetrics from "@/modules/reports/components/ReportMetrics";

export default function AnalyticsPage() {
	const [activeReport, setActiveReport] = useState("Sales Report");
	const [dateRange, setDateRange] = useState("This Month");

	const handleReportChange = (report: string) => {
		setActiveReport(report);
	};

	return (
		<main className="flex-1 space-y-6 p-8">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-foreground">
					Reports & Analytics
				</h2>
				<DateRangeSelector onRangeChange={setDateRange} />
			</div>

			<ReportMetrics dateRange={dateRange} />

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
					{activeReport === "Product Performance" && (
						<ProductPerformanceTable />
					)}
					{activeReport === "Inventory Report" && <InventoryReportTable />}
					{activeReport === "Cash Report" && (
						<AnalyticsTransactionTable transactions={transactions} />
					)}
				</div>
			</div>
		</main>
	);
}
