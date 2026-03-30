import React from "react";

interface TransactionsHeaderProps {
	title?: string;
	description?: string;
}
export const TransactionsHeader: React.FC<TransactionsHeaderProps> = React.memo(
	({
		title = "Your today's sales",
		description = "Manage and audit your store sales.",
	}) => {
		return (
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">
						{title}
					</h1>
					<p className="text-slate-500 font-medium mt-1 text-sm">
						{description}
					</p>
				</div>
			</div>
		);
	},
);

TransactionsHeader.displayName = "TransactionsHeader";

export default TransactionsHeader;
