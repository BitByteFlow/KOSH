"use client";
import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@kosh/ui/components/sidebar";

export default function Home() {
	return (
		<div>
			<SidebarProvider>
				{/* <SidebarTrigger /> */}
				<DashboardSidebar />
			</SidebarProvider>
		</div>
	);
}
