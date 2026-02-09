import type React from "react";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
	status: "active" | "inactive" | "out-of-stock" | "low-stock";
	children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
	const statusStyles = {
		active: "bg-green-50 text-green-700 border-green-200",
		inactive: "bg-gray-50 text-gray-700 border-gray-200",
		"out-of-stock": "bg-red-50 text-red-700 border-red-200",
		"low-stock": "bg-orange-50 text-orange-700 border-orange-200",
	};

	return (
		<span
			className={cn(
				"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
				statusStyles[status],
			)}
		>
			{children}
		</span>
	);
}
