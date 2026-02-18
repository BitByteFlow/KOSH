import type React from "react";

import { cn } from "@/lib/utils";

import { Status } from "@/gql/graphql";

interface StatusBadgeProps {
	status: Status | "low-stock";
	children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
	const statusStyles = {
		[Status.Active]: "bg-green-50 text-green-700 border-green-200",
		[Status.Inactive]: "bg-gray-50 text-gray-700 border-gray-200",
		[Status.OutOfStock]: "bg-red-50 text-red-700 border-red-200",
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
