import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface AnalyticsMetric {
	label: string;
	value: string;
	trend?: number;
	trendLabel?: string;
	isPositive?: boolean;
	subtitle?: string;
}

export const reportsAnalyticsService = {
	getAnalyticsMetrics: async (
		token: string | undefined,
		startDate: string,
		endDate: string
	): Promise<AnalyticsMetric[]> => {
		return clientApiClient.get<AnalyticsMetric[]>(
			API_ENDPOINTS.reports.analytics,
			token,
			{
				params: { startDate, endDate },
			}
		);
	},
};
