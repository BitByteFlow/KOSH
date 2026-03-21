"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { ReactNode } from "react";
import { queryClient } from "./client";
import { Toaster } from "sonner";
import { ApolloWrapper } from "../graphql/apolloWrapper";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StoreProvider } from "@/context/StoreContext";

interface ProvidersProps {
	children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
	return (
		<SessionProvider>
			<ProtectedRoute>
				<ApolloWrapper>
					<StoreProvider>
						<QueryClientProvider client={queryClient}>
							{children}
							<Toaster position="top-right" richColors closeButton />
							{process.env.NODE_ENV === "development" && (
								<ReactQueryDevtools initialIsOpen={false} />
							)}
						</QueryClientProvider>
					</StoreProvider>
				</ApolloWrapper>
			</ProtectedRoute>
		</SessionProvider>
	);
}
