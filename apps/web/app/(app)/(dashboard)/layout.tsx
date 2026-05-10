import React from "react";
import DashboardSidebar from "@/modules/dashboard/components/DashboardSidebar";
import SharedHeader from "@/components/SharedHeader";
import { SidebarProvider, SidebarInset } from "@kosh/ui/components/sidebar";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ApolloWrapper } from "@/lib/graphql/apolloWrapper";
import { StoreProvider } from "@/context/StoreContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query/client";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const layout = async ({ children }: { children: React.ReactNode }) => {
	const session = await auth();

	if (!session || !session.user) {
		redirect("/auth/get-started");
	}
	return (
		<ProtectedRoute>
			<ApolloWrapper>
				<StoreProvider>
					<QueryClientProvider client={queryClient}>
						<SidebarProvider>
							<DashboardSidebar />
							<SidebarInset>
								<SharedHeader />
								{children}
							</SidebarInset>
						</SidebarProvider>
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

export default layout;
