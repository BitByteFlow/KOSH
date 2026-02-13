"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { salesService, type CreateSaleRequest } from "@/services/sales.service";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";
import { accountKeys } from "@/modules/dashboard/hooks/useAccount";

export const salesKeys = {
	all: ["sales"] as const,
	list: () => [...salesKeys.all, "list"] as const,
	detail: (id: string) => [...salesKeys.all, "detail", id] as const,
	metrics: () => [...salesKeys.all, "metrics"] as const,
};

export function useCreateSale() {
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useMutation({
		mutationFn: (data: CreateSaleRequest) => 
			salesService.createSale(data, token),
		
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: salesKeys.list() });
			queryClient.invalidateQueries({ queryKey: accountKeys.balance() });
			queryClient.invalidateQueries({ queryKey: accountKeys.transactions() });
		},
		
		onError: (error) => {
			console.error("[useCreateSale] Error:", error);
			
			const message = getUserFriendlyErrorMessage(error);
			console.error("Sale creation failed:", message);
		},
	});
}

export function useSalesList() {
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useQuery({
		queryKey: salesKeys.list(),
		queryFn: () => salesService.getSales(token),
		enabled: !!token,
	});
}

export function useSalesMetrics() {
	const { data: session } = useSession();
	const token = session?.user?.token;

	return useQuery({
		queryKey: salesKeys.metrics(),
		queryFn: () => salesService.getSalesMetrics(token),
		enabled: !!token,
	});
}
