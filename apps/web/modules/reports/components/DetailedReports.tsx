"use client";

import { useState } from "react";
import { ReportTabs } from "@/modules/reports/components/ReportTabs";
import { SalesReportTable } from "@/modules/reports/components/SalesReportTable";
import { ProductPerformanceTable } from "@/modules/reports/components/ProductPerformanceTable";
import { InventoryReportTable } from "@/modules/reports/components/InventoryReportTable";
import { AnalyticsTransactionTable } from "@/modules/reports/components/AnalyticsTransaction";

export function DetailedReports() {
	const [activeReport, setActiveReport] = useState("Sales Report");

	const handleReportChange = (report: string) => {
		setActiveReport(report);
	};

	return (
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
				{activeReport === "Cash Report" && <AnalyticsTransactionTable />}
			</div>
		</div>
	);
}
