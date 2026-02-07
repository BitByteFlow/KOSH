import DashboardSidebar from "@/modules/dashboard/components/DashboardSidebar";
import SharedHeader from "@/components/SharedHeader";
import { SidebarProvider, SidebarTrigger } from "@kosh/ui/components/sidebar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SidebarProvider>
			<DashboardSidebar />
			<main className="w-full">
				<SharedHeader />
				{children}
			</main>
		</SidebarProvider>
	);
};

export default layout;
