"use client";

import { AnalyticsOverview } from "@/modules/reports/components/AnalyticsOverview";
import { DetailedReports } from "@/modules/reports/components/DetailedReports";

const ReportAnalyticsPage = () => {
	return (
		<main className="flex-1 space-y-8 p-4 md:p-8">
			<div className="flex items-center justify-between">
				<h2 className="text-3xl tracking-tighter font-semibold text-foreground">
					Reports & Analytics
				</h2>
			</div>

			<AnalyticsOverview />
			<DetailedReports />
		</main>
	);
}

export default ReportAnalyticsPage