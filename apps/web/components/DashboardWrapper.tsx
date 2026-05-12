"use client"

import React from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { ApolloWrapper } from "@/lib/graphql/apolloWrapper";
import { StoreProvider } from "@/context/StoreContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query/client";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const DashboardWrapper = ({children}: {children: React.ReactNode}) => {
	return (
		<ProtectedRoute>
			<ApolloWrapper>
				<StoreProvider>
					<QueryClientProvider client={queryClient}>
						{children}
						<Toaster
							position="top-right"
							richColors
							closeButton
						/>
						{process.env.NODE_ENV === "development" && (
							<ReactQueryDevtools initialIsOpen={false} />
						)}
					</QueryClientProvider>
				</StoreProvider>
			</ApolloWrapper>
		</ProtectedRoute>
	);
};

export default DashboardWrapper;
