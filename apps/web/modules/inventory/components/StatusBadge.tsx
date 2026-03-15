import type React from "react";

import { cn } from "@/lib/utils";

import { Status } from "@/gql/graphql";

interface StatusBadgeProps {
	status: Status | "low-stock";
	children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
	const statusStyles = {
		[Status.Active]: "bg-success/15 text-success border-success/30",
		[Status.Inactive]: "bg-muted text-muted-foreground border-border",
		[Status.OutOfStock]: "bg-destructive/15 text-destructive border-destructive/30",
		"low-stock": "bg-warning/15 text-warning border-warning/30",
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
