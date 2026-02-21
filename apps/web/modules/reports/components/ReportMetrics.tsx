"use client";

import React, { useMemo } from "react";
import { getDateRange } from "@/lib/date-utils";
import { AnalyticsMetricCard } from "./AnalyticsMetric";
import { MetricCardSkeleton } from "@/components/MetricCardSkeletion";
import { useQuery } from "@apollo/client/react";
import { gql } from "@/gql";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";


const GET_REPORT_METRICS = gql(`
	query getReportMetrics($startDate: String!, $endDate: String!){
		getAnalyticsMetrics (startDate: $startDate, endDate: $endDate) {
			success
			message
			data {
				label
				value
				trend
				trendLabel
				isPositive
				subtitle
			}
		}
	}
`)

const ReportMetrics = ({ dateRange }: { dateRange: string }) => {
	const { startDate, endDate } = useMemo(
		() => getDateRange(dateRange),
		[dateRange],
	);

	const { data: rawData, loading, error } = useQuery(GET_REPORT_METRICS, {
		variables: { startDate, endDate }
	});

	const metricsResponse = useMemo(() =>
		parseGraphQLListResponse(rawData?.getAnalyticsMetrics),
		[rawData?.getAnalyticsMetrics]
	);

	const metrics = metricsResponse.data || [];

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
		return <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">Error loading metrics</div>;
	}

	return (
		<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
			{metrics.map((metric) => (
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
