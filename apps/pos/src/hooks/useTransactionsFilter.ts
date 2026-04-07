import { useState, useCallback, useMemo } from "react";
import type { Transaction } from "../types/transactions";

interface UseTransactionsFilterOptions {
	initialSearch?: string;
	initialPaymentType?: "CASH" | "ONLINE" | "CREDIT" | "ALL";
}

export const useTransactionsFilter = (
	options?: UseTransactionsFilterOptions,
) => {
	const [searchTerm, setSearchTerm] = useState(
		options?.initialSearch || "",
	);
	const [selectedPaymentType, setSelectedPaymentType] = useState<
		"CASH" | "ONLINE" | "CREDIT" | "ALL"
	>(options?.initialPaymentType || "ALL");

	const handleSearchChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setSearchTerm(e.target.value);
		},
		[],
	);

	const handlePaymentTypeChange = useCallback(
		(type: "CASH" | "ONLINE" | "CREDIT" | "ALL") => {
			setSelectedPaymentType(type);
		},
		[],
	);

	const clearFilters = useCallback(() => {
		setSearchTerm("");
		setSelectedPaymentType("ALL");
	}, []);

	const isActive = useMemo(
		() => searchTerm.length > 0 || selectedPaymentType !== "ALL",
		[searchTerm, selectedPaymentType],
	);

	return {
		searchTerm,
		selectedPaymentType,
		isActive,
		handleSearchChange,
		handlePaymentTypeChange,
		clearFilters,
		setSearchTerm,
		setSelectedPaymentType,
	};
};

/**
 * Hook to filter transactions based on search and payment type
 */
export const useFilteredTransactions = (
	transactions: Transaction[],
	searchTerm: string,
	selectedPaymentType: "CASH" | "ONLINE" | "CREDIT" | "ALL",
) => {
	return useMemo(() => {
		if (!transactions?.length) return [];

		return transactions.filter((tx) => {
			// Payment type filter
			if (selectedPaymentType !== "ALL" && tx.paymentType !== selectedPaymentType) {
				return false;
			}

			// Search filter
			if (searchTerm) {
				const search = searchTerm.toLowerCase();
				const matchesId = tx.id.toLowerCase().includes(search);
				const matchesPaymentType = tx.paymentType.toLowerCase().includes(search);
				const matchesCustomer = tx.customerName?.toLowerCase().includes(search);

				if (!matchesId && !matchesPaymentType && !matchesCustomer) {
					return false;
				}
			}

			return true;
		});
	}, [transactions, searchTerm, selectedPaymentType]);
};

/**
 * Hook to calculate transaction statistics
 */
export const useTransactionStats = (transactions: Transaction[]) => {
	return useMemo(() => {
		if (!transactions?.length) {
			return {
				totalRevenue: 0,
				totalTransactions: 0,
				averageTransactionValue: 0,
				cashRevenue: 0,
				onlineRevenue: 0,
				creditRevenue: 0,
			};
		}

		const totalRevenue = transactions.reduce(
			(sum, tx) => sum + tx.total,
			0,
		);
		const totalTransactions = transactions.length;
		const averageTransactionValue = totalRevenue / totalTransactions;

		const cashRevenue = transactions
			.filter((tx) => tx.paymentType === "CASH")
			.reduce((sum, tx) => sum + tx.total, 0);

		const onlineRevenue = transactions
			.filter((tx) => tx.paymentType === "ONLINE")
			.reduce((sum, tx) => sum + tx.total, 0);

		const creditRevenue = transactions
			.filter((tx) => tx.paymentType === "CREDIT")
			.reduce((sum, tx) => sum + tx.total, 0);

		return {
			totalRevenue,
			totalTransactions,
			averageTransactionValue,
			cashRevenue,
			onlineRevenue,
			creditRevenue,
		};
	}, [transactions]);
};
