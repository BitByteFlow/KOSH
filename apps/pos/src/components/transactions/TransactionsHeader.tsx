import React from "react";

interface TransactionsHeaderProps {
	title?: string;
	description?: string;
	totalRevenue?: number;
	totalTransactions?: number;
}
export const TransactionsHeader: React.FC<TransactionsHeaderProps> =
	React.memo(
		({
			title = "Your today's sales",
			description = "Manage and audit your store sales.",
			totalRevenue,
			totalTransactions,
		}) => {
			const formatCurrency = (amount: number) => {
				return `Rs. ${amount.toFixed(2)}`;
			};

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

					{(totalRevenue !== undefined || totalTransactions !== undefined) && (
						<div className="flex items-center gap-6">
							{totalRevenue !== undefined && (
								<div className="text-right">
									<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
										Total Revenue
									</p>
									<p className="text-xl font-black text-slate-900">
										{formatCurrency(totalRevenue)}
									</p>
								</div>
							)}
							{totalTransactions !== undefined && (
								<div className="text-right">
									<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
										Transactions
									</p>
									<p className="text-xl font-black text-slate-900">
										{totalTransactions}
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			);
		},
	);

TransactionsHeader.displayName = "TransactionsHeader";

export default TransactionsHeader;
