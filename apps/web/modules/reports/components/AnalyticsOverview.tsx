"use client";

import { useState } from "react";
import { DateRangeSelector } from "@/modules/reports/components/DateRangeSelector";
import ReportMetrics from "@/modules/reports/components/ReportMetrics";
import { SalesTrendChart } from "@/modules/reports/components/SalesTrendChart";
import { TopProductsChart } from "@/modules/reports/components/TopProductsChart";

export function AnalyticsOverview() {
	const [dateRange, setDateRange] = useState("This Month");

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium text-foreground">Analytics Overview</h3>
				<DateRangeSelector onRangeChange={setDateRange} />
			</div>

			<ReportMetrics dateRange={dateRange} />

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<SalesTrendChart dateRange={dateRange} />
				</div>
				<TopProductsChart dateRange={dateRange} />
			</div>
		</div>
	);
}
