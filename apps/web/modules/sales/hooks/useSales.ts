"use client";

import { useMutation, useQuery, useApolloClient } from "@apollo/client/react";
import { useQueryClient } from "@tanstack/react-query";
import {
	CREATE_SALE,
	GET_SALES,
	GET_SALES_METRICS
} from "@/services/sales.service";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";
import { accountKeys } from "@/modules/dashboard/hooks/useAccount";
import type {
	Sale,
	SaleResponse,
	SalesMetricsResponse,
	CreateSaleInput
} from "@/gql/graphql";

export const salesKeys = {
	all: ["sales"] as const,
	list: () => [...salesKeys.all, "list"] as const,
	detail: (id: string) => [...salesKeys.all, "detail", id] as const,
	metrics: () => [...salesKeys.all, "metrics"] as const,
};

export function useCreateSale() {
	const queryClient = useQueryClient();
	const apolloClient = useApolloClient();

	return useMutation<{ createSale: SaleResponse }, { input: CreateSaleInput }>(CREATE_SALE, {
		onCompleted: (data) => {
			if (data.createSale?.success) {
				toast.success(data.createSale.message || "Sale completed successfully!");

				// Update Apollo cache to immediately show the new sale in the UI
				apolloClient.cache.updateQuery<{ getSales: SaleResponse }>(
					{ query: GET_SALES },
					(prev) => {
						if (!prev?.getSales?.data) {
							return prev;
						}

						const newSaleData = data.createSale.data;
						if (!newSaleData || newSaleData.length === 0) {
							return prev;
						}

						return {
							getSales: {
								...prev.getSales,
								data: [...newSaleData, ...prev.getSales.data],
							},
						};
					}
				);

				// Invalidate React Query caches for related data
				queryClient.invalidateQueries({ queryKey: salesKeys.list() });
				queryClient.invalidateQueries({ queryKey: accountKeys.balance() });
				queryClient.invalidateQueries({ queryKey: accountKeys.transactions() });
				queryClient.invalidateQueries({ queryKey: salesKeys.metrics() });
			} else {
				toast.error(data.createSale?.message || "Failed to create sale");
			}
		},
		onError: (error) => {
			console.error("[useCreateSale] Error:", error);
			const message = getUserFriendlyErrorMessage(error);
			toast.error(message || "Failed to create sale");
		}
	});
}

export function useSalesList() {
	return useQuery<{ getSales: SaleResponse }>(GET_SALES);
}

export function useSalesMetrics() {
	return useQuery<{ getSalesMetrics: SalesMetricsResponse }>(GET_SALES_METRICS);
}
