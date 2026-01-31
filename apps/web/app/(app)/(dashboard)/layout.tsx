import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@kosh/ui/components/sidebar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
	return (
		<SidebarProvider>
			<DashboardSidebar />
			<main>{children}</main>
		</SidebarProvider>
	);
};

export default layout;
