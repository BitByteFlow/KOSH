import React from "react";
import { ShoppingBag, RefreshCw } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

interface TransactionsEmptyStateProps {
	hasSearch: boolean;
	searchTerm?: string;
	onRetry?: () => void;
	isLoading?: boolean;
}
export const TransactionsEmptyState: React.FC<TransactionsEmptyStateProps> =
	React.memo(({ hasSearch, searchTerm, onRetry, isLoading }) => {
		return (
			<div
				className="flex flex-col items-center justify-center text-slate-400 gap-4 py-16"
				aria-live="polite"
			>
				{isLoading ? (
					<>
						<RefreshCw
							size={48}
							className="text-slate-200 animate-spin"
							aria-hidden="true"
						/>
						<p className="font-bold text-slate-500">Loading transactions...</p>
					</>
				) : (
					<>
						<ShoppingBag
							size={48}
							className="text-slate-200"
							aria-hidden="true"
						/>
						<p className="font-bold text-slate-500">
							{hasSearch
								? `No results for "${searchTerm}"`
								: "No transactions found"}
						</p>
						{hasSearch && onRetry && (
							<Button
								variant="outline"
								onClick={onRetry}
								className="mt-2 text-sm"
								aria-label="Clear search filters"
							>
								Clear filters
							</Button>
						)}
					</>
				)}
			</div>
		);
	});

TransactionsEmptyState.displayName = "TransactionsEmptyState";

export default TransactionsEmptyState;
