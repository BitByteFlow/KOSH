/**
 * React Query Provider for KOSH POS
 * Configures and provides TanStack Query to the application
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';

/**
 * Create and configure the QueryClient
 */
const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Default retry logic
        retry: 1,
        // Default stale time (5 minutes)
        staleTime: 1000 * 60 * 5,
        // Default refetch on window focus
        refetchOnWindowFocus: false,
        // Handle errors globally
        onError: (error: any) => {
          // Log errors for monitoring
          console.error('[React Query Error]', error);
        },
      },
      mutations: {
        // Don't retry mutations by default
        retry: 0,
      },
    },
  });
};

// Singleton query client instance
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

/**
 * QueryProvider wraps the application with React Query functionality
 */
export const QueryProvider = ({ children }: QueryProviderProps) => {
  const client = getQueryClient();

  return (
    <QueryClientProvider client={client}>
      {children}
      {/* React Query DevTools for development */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default QueryProvider;
