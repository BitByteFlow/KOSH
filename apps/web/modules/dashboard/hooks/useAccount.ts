"use client";

import {
	useQuery as useApolloQuery,
	useMutation as useApolloMutation,
	useApolloClient,
} from "@apollo/client/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	GET_CURRENT_CASH_BALANCE,
	GET_ACCOUNT_TRANSACTIONS,
	CREATE_TRANSACTION,
	type GetTransactionsParams,
} from "@/services/account.service";
import { toast } from "sonner";
import {
	BalanceResponse,
	PaginatedTransactionsResponse,
	AccountResponse,
	CreateTransactionInput,
} from "@/gql/graphql";

export const accountKeys = {
	all: ["account"] as const,
	balance: () => [...accountKeys.all, "balance"] as const,
	transactions: () => [...accountKeys.all, "transactions"] as const,
	transactionList: (params: GetTransactionsParams) =>
		[...accountKeys.transactions(), params] as const,
};

export function useAccountBalance() {
	return useApolloQuery<{ getCurrentCashBalance: BalanceResponse }>(
		GET_CURRENT_CASH_BALANCE,
		{
			fetchPolicy: "cache-and-network",
			pollInterval: 5 * 60 * 1000,
		},
	);
}

export function useAccountTransactions(params: GetTransactionsParams = {}) {
	return useApolloQuery<{
		getAccountTransactions: PaginatedTransactionsResponse;
	}>(GET_ACCOUNT_TRANSACTIONS, {
		variables: {
			page: params.page || 1,
			limit: params.limit || 10,
			sortBy: params.sortBy || "createdAt",
			sortOrder: params.sortOrder || "desc",
		},
		fetchPolicy: "cache-and-network",
	});
}

export function useCreateTransaction() {
	const queryClient = useQueryClient();
	const apolloClient = useApolloClient();

	return useApolloMutation<
		{ createTransaction: AccountResponse },
		{ input: CreateTransactionInput }
	>(CREATE_TRANSACTION, {
		onCompleted: (data: { createTransaction: AccountResponse }) => {
			if (data.createTransaction.success) {
				toast.success(
					data.createTransaction.message ||
						"Transaction completed successfully!",
				);

				const newTransaction = data.createTransaction.data;

				if (newTransaction) {
					// Use cache.modify to update all cached queries that contain getAccountTransactions
					// This works regardless of which query document was used to fetch the data
					apolloClient.cache.modify({
						fields: {
							getAccountTransactions: (existing, { toReference }) => {
								if (!existing || !existing.data) {
									return existing;
								}

								const newRef = toReference(newTransaction);
								if (!newRef) return existing;

								// Check for duplicates
								const exists = existing.data.some(
									(item: any) => item.__ref === newRef.__ref,
								);
								if (exists) return existing;

								return {
									...existing,
									data: [newRef, ...existing.data],
								};
							},
						},
					});
				}

				// Invalidate React Query caches for related data (to maintain sync with components not yet migrated)
				queryClient.invalidateQueries({ queryKey: accountKeys.balance() });
				queryClient.invalidateQueries({ queryKey: accountKeys.transactions() });
			} else {
				toast.error(data.createTransaction.message || "Transaction failed");
			}
		},
		onError: (error: Error) => {
			console.error("[useCreateTransaction] Error:", error);
			toast.error(error.message || "Failed to create transaction");
		},
	});
}
