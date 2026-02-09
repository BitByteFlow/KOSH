"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { accountService, type CreateTransactionRequest } from "@/services/account.service";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";

export const accountKeys = {
	all: ["account"] as const,
	balance: () => [...accountKeys.all, "balance"] as const,
	transactions: () => [...accountKeys.all, "transactions"] as const,
};

export function useAccountBalance() {
	return useQuery({
		queryKey: accountKeys.balance(),
		queryFn: accountService.getDashboardMetrics,
		// Refetch every 5 minutes to keep dashboard fresh
		refetchInterval: 5 * 60 * 1000,
	});
}

export function useCreateTransaction() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateTransactionRequest) => 
			accountService.createTransaction(data),
		
		onSuccess: () => {
			// Invalidate balance query to refetch updated data
			queryClient.invalidateQueries({ queryKey: accountKeys.balance() });
		},
		
		onError: (error) => {
			// Log error for debugging
			console.error("[useCreateTransaction] Error:", error);
			
			// You can add toast notification here
			const message = getUserFriendlyErrorMessage(error);
			console.error("Transaction failed:", message);
		},
	});
}