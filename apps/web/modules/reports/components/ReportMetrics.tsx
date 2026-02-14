import React, { useMemo } from "react";
import { useAnalyticsMetrics } from "../hooks/useReports";
import { getDateRange } from "@/lib/date-utils";
import { AnalyticsMetricCard } from "./AnalyticsMetric";
import { MetricCardSkeleton } from "@/components/MetricCardSkeletion";

const ReportMetrics = ({ dateRange }: { dateRange: string }) => {
	const { startDate, endDate } = useMemo(
		() => getDateRange(dateRange),
		[dateRange],
	);
	console.log("dates :", startDate, endDate);
	const {
		data: metrics,
		isPending,
		isError,
	} = useAnalyticsMetrics(startDate, endDate);

	if (isPending) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
			</div>
		);
	}
	if (isError) {
		return <h2>error</h2>;
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{metrics?.map((metric) => (
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
	);
};

export default ReportMetrics;
