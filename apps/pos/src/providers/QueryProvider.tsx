import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";

const createQueryClient = () => {
	return new QueryClient({
		defaultOptions: {
			queries: {
				retry: 1,
				staleTime: 1000 * 60 * 5,
				refetchOnWindowFocus: false,
			},
			mutations: {
				retry: 0,
			},
		},
	});
};

let queryClient: QueryClient | null = null;

const getQueryClient = () => {
	if (!queryClient) {
		queryClient = createQueryClient();
	}
	return queryClient;
};

interface QueryProviderProps {
	children: ReactNode;
}

const isDev = import.meta.env.VITE_DEV;

export const QueryProvider = ({ children }: QueryProviderProps) => {
	const client = getQueryClient();

	return (
		<QueryClientProvider client={client}>
			{children}
			{"development" === isDev && <ReactQueryDevtools initialIsOpen={true} />}
		</QueryClientProvider>
	);
};

export default QueryProvider;
