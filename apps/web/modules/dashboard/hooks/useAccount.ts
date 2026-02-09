"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { accountService, type CreateTransactionRequest } from "@/services/account.service";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";

export const accountKeys = {
	all: ["account"] as const,
	balance: () => [...accountKeys.all, "balance"] as const,
	transactions: () => [...accountKeys.all, "transactions"] as const,
};

export function useAccountBalance() {
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useQuery({
		queryKey: accountKeys.balance(),
		queryFn: () => accountService.getDashboardMetrics(token),
		enabled: !!token,
		refetchInterval: 5 * 60 * 1000,
	});
}

export function useCreateTransaction() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: (data: CreateTransactionRequest) => 
			accountService.createTransaction(data, token),
		
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: accountKeys.balance() });
		},
		
		onError: (error) => {
			console.error("[useCreateTransaction] Error:", error);
			
			const message = getUserFriendlyErrorMessage(error);
			console.error("Transaction failed:", message);
		},
	});
}