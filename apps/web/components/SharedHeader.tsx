"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { cn, capitalizeWords } from "@/lib/utils";
import NotificationDropdown from "@/modules/notifications/components/NotificationDropdown";
import { SidebarTrigger } from "@kosh/ui/components/sidebar";

const SharedHeader = () => {
	const pathname = usePathname();

	const pathSegments = pathname.substring(1, pathname.length);
	const displayTitle =
		pathSegments.length > 0 ? capitalizeWords(pathSegments) : "Dashboard";

	return (
		<header
			className={cn(
				"sticky top-0 z-10 w-full flex justify-between items-center",
				"bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
				"py-3 px-4 md:px-6 border-b border-border",
			)}
		>
			<div className="flex items-center gap-3">
				<SidebarTrigger className="-ml-1" />
				<h2 className="text-lg font-semibold">{displayTitle}</h2>
			</div>
			<div className="flex items-center gap-2">
				<NotificationDropdown />
				{/* <button className="p-2 rounded-full hover:bg-muted transition-colors">
					<Ellipsis className="w-5 h-5 text-muted-foreground" />
				</button> */}
			</div>
		</header>
	);
};

export default SharedHeader;
