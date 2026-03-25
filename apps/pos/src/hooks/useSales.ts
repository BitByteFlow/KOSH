import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesApi } from "../services/sales.api";
import type { CreateSaleRequest, SaleFilters } from "../types/api";
import { toast } from "sonner";

const SALE_KEYS = {
	all: ["sales"] as const,
	lists: () => [...SALE_KEYS.all, "list"] as const,
	list: (filters?: SaleFilters) => [...SALE_KEYS.lists(), filters] as const,
	details: () => [...SALE_KEYS.all, "detail"] as const,
	detail: (id: string) => [...SALE_KEYS.details(), id] as const,
	today: () => [...SALE_KEYS.all, "today"] as const,
	store: (storeId: string) => [...SALE_KEYS.all, "store", storeId] as const,
};

export const useSaleById = (id: string, enabled = true) => {
	return useQuery({
		queryKey: SALE_KEYS.detail(id),
		queryFn: () => salesApi.getById(id),
		enabled: !!id && enabled,
		staleTime: 1000 * 60 * 5,
	});
};

export const useAllSales = (filters?: SaleFilters) => {
	return useQuery({
		queryKey: SALE_KEYS.list(filters),
		queryFn: () => salesApi.getAll(filters),
		staleTime: 1000 * 30,
	});
};

export const useTodaySales = () => {
	return useQuery({
		queryKey: SALE_KEYS.today(),
		queryFn: () => salesApi.getTodaySales(),
		staleTime: 1000 * 30,
	});
};

export const useSalesByStore = (storeId: string, filters?: SaleFilters) => {
	return useQuery({
		queryKey: SALE_KEYS.store(storeId),
		queryFn: () => salesApi.getByStore(storeId, filters),
		enabled: !!storeId,
		staleTime: 1000 * 30,
	});
};

export const useCreateSale = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (saleData: CreateSaleRequest) => salesApi.create(saleData),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SALE_KEYS.lists() });
			queryClient.invalidateQueries({ queryKey: SALE_KEYS.today() });
		},
		onError: (error: any) => {
			const message =
				error?.response?.message || error?.message || "Failed to create sale";
			toast.error(message);
		},
	});
};

export const useVoidSale = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
			salesApi.void(id, reason),
		onSuccess: (_, { id }) => {
			queryClient.invalidateQueries({ queryKey: SALE_KEYS.detail(id) });
			queryClient.invalidateQueries({ queryKey: SALE_KEYS.lists() });
			toast.success("Sale voided successfully");
		},
		onError: (error: any) => {
			const message =
				error?.response?.message || error?.message || "Failed to void sale";
			toast.error(message);
		},
	});
};

export const useSaleInvalidate = () => {
	const queryClient = useQueryClient();

	return {
		invalidateAll: () =>
			queryClient.invalidateQueries({ queryKey: SALE_KEYS.all }),
		invalidateList: () =>
			queryClient.invalidateQueries({ queryKey: SALE_KEYS.lists() }),
		invalidateDetail: (id: string) =>
			queryClient.invalidateQueries({ queryKey: SALE_KEYS.detail(id) }),
		invalidateToday: () =>
			queryClient.invalidateQueries({ queryKey: SALE_KEYS.today() }),
	};
};

export { SALE_KEYS };
