import React from "react";
import { cn } from "@/lib/utils";
import NotificationDropdown from "@/modules/notifications/components/NotificationDropdown";
import { SidebarTrigger } from "@kosh/ui/components/sidebar";
import { StoreSwitcher } from "./StoreSwitcher";

const SharedHeader = () => {
	return (
		<header
			className={cn(
				"sticky top-0 z-10 w-full flex justify-between items-center",
				"bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
				"py-3 px-4 md:px-6 border-b border-border",
			)}
		>
			<div className="flex items-center gap-3 flex-1">
				<SidebarTrigger className="-ml-1" />
				<p className="hidden md:block text-sm text-secondary-foreground font-medium opacity-70 border-l pl-3 border-border">
					{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
				</p>
			</div>
			<div className="flex items-center gap-2">
				<NotificationDropdown />
				<StoreSwitcher />
			</div>
		</header>
	);
};

export default SharedHeader;
