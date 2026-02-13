import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { reportsAnalyticsService } from "@/services/reportsAnalytics.service";

export const reportKeys = {
	all: ["reports"] as const,
	analytics: (startDate: string, endDate: string) => 
		[...reportKeys.all, "analytics", { startDate, endDate }] as const,
};

export function useAnalyticsMetrics(startDate: string, endDate: string) {
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useQuery({
		queryKey: reportKeys.analytics(startDate, endDate),
		queryFn: () => reportsAnalyticsService.getAnalyticsMetrics(token, startDate, endDate),
		enabled: !!token && !!startDate && !!endDate,
	});
}
