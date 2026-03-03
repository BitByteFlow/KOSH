import { useQuery as useApolloQuery } from "@apollo/client/react";
import {
	GET_ANALYTICS_METRICS,
	GET_SALES_TREND,
	GET_TOP_PRODUCTS,
	GET_PRODUCT_PERFORMANCE,
	GET_ANALYTICS_TRANSACTIONS
} from "@/services/reportsAnalytics.service";
import {
	GetReportDataQuery,
	GetReportDataQueryVariables,
	GetSalesTrendQuery,
	GetSalesTrendQueryVariables,
	GetTopProductsQuery,
	GetTopProductsQueryVariables,
	GetProductPerformanceQuery,
	GetProductPerformanceQueryVariables,
	GetAnalyticsTransactionsQuery,
	GetAnalyticsTransactionsQueryVariables,
} from "@/gql/graphql";

export const reportKeys = {
	all: ["reports"] as const,
	analytics: (startDate: string, endDate: string) =>
		[...reportKeys.all, "analytics", { startDate, endDate }] as const,
};

export function useAnalyticsMetrics(startDate: string, endDate: string) {
	return useApolloQuery<GetReportDataQuery, GetReportDataQueryVariables>(
		GET_ANALYTICS_METRICS,
		{
			variables: { startDate, endDate },
			skip: !startDate || !endDate,
		}
	);
}

export function useSalesTrend(startDate: string, endDate: string) {
	return useApolloQuery<GetSalesTrendQuery, GetSalesTrendQueryVariables>(
		GET_SALES_TREND,
		{
			variables: { startDate, endDate },
			skip: !startDate || !endDate,
		}
	);
}

export function useTopProducts(startDate: string, endDate: string) {
	return useApolloQuery<GetTopProductsQuery, GetTopProductsQueryVariables>(
		GET_TOP_PRODUCTS,
		{
			variables: { startDate, endDate },
			skip: !startDate || !endDate,
		}
	);
}

export function useProductPerformance(filters: any) {
	return useApolloQuery<GetProductPerformanceQuery, GetProductPerformanceQueryVariables>(
		GET_PRODUCT_PERFORMANCE,
		{
			variables: { filters },
		}
	);
}

export function useAnalyticsTransactions(filters: any) {
	return useApolloQuery<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>(
		GET_ANALYTICS_TRANSACTIONS,
		{
			variables: { filters },
		}
	);
}
