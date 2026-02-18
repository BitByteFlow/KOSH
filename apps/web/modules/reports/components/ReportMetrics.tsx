import React, { useMemo } from "react";
import { useAnalyticsMetrics } from "../hooks/useReports";
import { getDateRange } from "@/lib/date-utils";
import { AnalyticsMetricCard } from "./AnalyticsMetric";
import { MetricCardSkeleton } from "@/components/MetricCardSkeletion";
import { useQuery } from "@apollo/client/react";
import { gql } from "@/gql";


const GET_REPORT_METRICS = gql(`
	query getReportData ($startDate: String!, $endDate: String!){
		getAnalyticsMetrics (startDate: $startDate, endDate: $endDate) {
			label
			value
			trend
			trendLabel
			isPositive
			subtitle
		}
	}
`)

const ReportMetrics = ({ dateRange }: { dateRange: string }) => {
	const { startDate, endDate } = useMemo(
		() => getDateRange(dateRange),
		[dateRange],
	);

	const { data: metrics, loading, error } = useQuery(GET_REPORT_METRICS, { variables: { startDate, endDate } })

	if (loading) {
		return (
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
				<MetricCardSkeleton />
			</div>
		);
	}
	if (error) {
		return <h2>error</h2>;
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{metrics?.getAnalyticsMetrics?.map((metric) => (
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
