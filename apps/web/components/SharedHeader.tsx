"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { Bell, Ellipsis } from "lucide-react";
import { cn, capitalizeWords } from "@/lib/utils";

const SharedHeader = () => {
	const pathname = usePathname();

	const pathSegments = pathname.substring(1, pathname.length);
	const displayTitle =
		pathSegments.length > 0 ? capitalizeWords(pathSegments) : "Dashboard";

	return (
		<div
			className={cn(
				"sticky top-0 z-10 w-full flex justify-between items-center",
				"bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
				"py-3 px-6 border-b border-border",
			)}
		>
			<h2 className="text-lg font-semibold">{displayTitle}</h2>
			<div className="flex items-center gap-2">
				<button className="p-2 rounded-full hover:bg-muted transition-colors">
					<Bell className="w-5 h-5 text-muted-foreground" />
				</button>
				<button className="p-2 rounded-full hover:bg-muted transition-colors">
					<Ellipsis className="w-5 h-5 text-muted-foreground" />
				</button>
			</div>
		</div>
	);
};

export default SharedHeader;
