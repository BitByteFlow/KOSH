import { QueryClient } from "@tanstack/react-query";
import { API_CONFIG } from "../api/config";

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: API_CONFIG.cache.staleTime,
			
			gcTime: API_CONFIG.cache.cacheTime,
			
			retry: (failureCount, error) => {
				if (error instanceof Error && "statusCode" in error) {
					const statusCode = (error as any).statusCode;
					if (statusCode >= 400 && statusCode < 500) {
						return false;
					}
				}
				return failureCount < API_CONFIG.retry.attempts;
			},
			
			retryDelay: (attemptIndex) => 
				Math.min(API_CONFIG.retry.delay * Math.pow(API_CONFIG.retry.backoff, attemptIndex), 30000),
			
			refetchOnWindowFocus: false,
			
			refetchOnMount: true,
			
			refetchOnReconnect: false,
		},
		mutations: {
			retry: 1,
		},
	},
});
