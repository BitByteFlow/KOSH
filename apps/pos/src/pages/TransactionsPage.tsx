import React, { useCallback } from "react";
import { Card, CardContent, CardHeader } from "@kosh/ui/components/card";
import { useAllSales } from "../hooks/useSales";
import Loading from "../components/Loading";

import {
	TransactionsHeader,
	TransactionsSearch,
	TransactionsStatsLegend,
	TransactionsTable,
	TransactionsEmptyState,
	TransactionsErrorState,
} from "../components/transactions";

import {
	useTransactionsFilter,
	useFilteredTransactions,
	useTransactionStats,
} from "../hooks/useTransactionsFilter";

import type { Transaction } from "../types/transactions";

const TransactionsPage: React.FC = () => {
	const {
		data: transactions,
		isLoading,
		error,
		refetch,
		isRefetching,
	} = useAllSales();

	const {
		searchTerm,
		selectedPaymentType,
		handleSearchChange,
		handlePaymentTypeChange,
	} = useTransactionsFilter();

	const filteredTransactions = useFilteredTransactions(
		transactions || [],
		searchTerm,
		selectedPaymentType,
	);

	const stats = useTransactionStats(filteredTransactions);

	const handleTransactionClick = useCallback((transaction: Transaction) => {
		// TODO: Implement transaction detail view
		console.log("Transaction clicked:", transaction);
	}, []);

	const handleClearSearch = useCallback(() => {
		handleSearchChange({
			target: { value: "" },
		} as React.ChangeEvent<HTMLInputElement>);
	}, [handleSearchChange]);

	if (isLoading) {
		return <Loading />;
	}

	if (error) {
		return (
			<TransactionsErrorState
				error={error as Error}
				onRetry={() => refetch()}
				isRetrying={isRefetching}
			/>
		);
	}

	const hasResults = filteredTransactions.length > 0;
	const hasActiveSearch =
		searchTerm.length > 0 || selectedPaymentType !== "ALL";

	return (
		<section
			className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
			aria-label="Transactions history"
		>
			<TransactionsHeader />

			<Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
				<CardHeader className="border-b border-slate-50 bg-slate-50/30">
					<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
						<TransactionsSearch
							searchTerm={searchTerm}
							onSearchChange={handleSearchChange}
							placeholder="Search by ID, payment type, or customer..."
						/>

						<TransactionsStatsLegend
							stats={{
								cashRevenue: stats.cashRevenue,
								onlineRevenue: stats.onlineRevenue,
								creditRevenue: stats.creditRevenue,
								totalRevenue: stats.totalRevenue,
							}}
							selectedPaymentType={selectedPaymentType}
							onPaymentTypeChange={handlePaymentTypeChange}
						/>
					</div>
				</CardHeader>

				<CardContent className="p-2">
					{hasResults ? (
						<TransactionsTable
							transactions={filteredTransactions}
							onTransactionClick={handleTransactionClick}
						/>
					) : (
						<TransactionsEmptyState
							hasSearch={hasActiveSearch}
							searchTerm={searchTerm}
							onRetry={handleClearSearch}
						/>
					)}
				</CardContent>
			</Card>
		</section>
	);
};

export default TransactionsPage;
