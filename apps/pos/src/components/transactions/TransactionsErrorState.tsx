import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

interface TransactionsErrorStateProps {
	error: Error;
	onRetry: () => void;
	isRetrying?: boolean;
}
export const TransactionsErrorState: React.FC<TransactionsErrorStateProps> =
	React.memo(({ error, onRetry, isRetrying }) => {
		return (
			<div
				className="p-8 text-center h-full flex items-center justify-center"
				role="alert"
				aria-live="assertive"
			>
				<div className="flex flex-col items-center gap-4">
					<AlertCircle
						className="w-12 h-12 text-red-400"
						aria-hidden="true"
					/>
					<div>
						<h3 className="text-xl font-bold text-slate-800">
							Error loading history
						</h3>
						<p className="text-slate-500 mt-1">{error.message}</p>
					</div>
					<Button
						variant="outline"
						onClick={onRetry}
						disabled={isRetrying}
						className="mt-2"
						aria-label="Retry loading transactions"
					>
						{isRetrying ? (
							<span className="flex items-center gap-2">
								<RefreshCw
									size={16}
									className="animate-spin"
									aria-hidden="true"
								/>
								Loading...
							</span>
						) : (
							<span className="flex items-center gap-2">
								<RefreshCw
									size={16}
									aria-hidden="true"
								/>
								Try Again
							</span>
						)}
					</Button>
				</div>
			</div>
		);
	});

TransactionsErrorState.displayName = "TransactionsErrorState";

export default TransactionsErrorState;
