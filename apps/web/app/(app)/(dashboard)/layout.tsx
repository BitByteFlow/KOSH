import React from "react";
import DashboardSidebar from "@/modules/dashboard/components/DashboardSidebar";
import SharedHeader from "@/components/SharedHeader";
import { SidebarProvider } from "@kosh/ui/components/sidebar";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import { redirect } from "next/navigation";

const layout = async ({ children }: { children: React.ReactNode }) => {
	const session = await auth();

	if (!session || !session.user) {
		redirect("/auth/get-started");
	}
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
