import {
	useQuery,
	useInfiniteQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { productsApi } from "../services/products.api";
import type { ProductFilterParams } from "../types/api";

const PRODUCT_KEYS = {
	all: ["products"] as const,
	lists: () => [...PRODUCT_KEYS.all, "list"] as const,
	list: (filters: ProductFilterParams) =>
		[...PRODUCT_KEYS.lists(), filters] as const,
	details: () => [...PRODUCT_KEYS.all, "detail"] as const,
	detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
	variants: () => [...PRODUCT_KEYS.all, "variant"] as const,
	variant: (id: string) => [...PRODUCT_KEYS.variants(), id] as const,
	variantByBarcode: (barcode: string) =>
		[...PRODUCT_KEYS.variants(), "barcode", barcode] as const,
};

export const useProductSearch = (
	params: ProductFilterParams,
	enabled = true,
) => {
	return useQuery({
		queryKey: PRODUCT_KEYS.list(params),
		queryFn: () => productsApi.search(params),
		enabled,
		staleTime: 0,
		retry: 2,
	});
};

export const useInfiniteProductSearch = (
	params: Omit<ProductFilterParams, "page">,
) => {
	return useInfiniteQuery({
		queryKey: PRODUCT_KEYS.list(params),
		queryFn: ({ pageParam = 1 }) =>
			productsApi.search({ ...params, page: pageParam as number }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			const nextPage = lastPage.page + 1;
			return nextPage <= lastPage.totalPages ? nextPage : undefined;
		},
		staleTime: 1000 * 60 * 5,
	});
};

export const useProductById = (id: string, enabled = true) => {
	return useQuery({
		queryKey: PRODUCT_KEYS.detail(id),
		queryFn: () => productsApi.getById(id),
		enabled: !!id && enabled,
		staleTime: 1000 * 60 * 10, // 10 minutes
	});
};

export const useVariantByBarcode = (barcode: string | null, enabled = true) => {
	return useQuery({
		queryKey: PRODUCT_KEYS.variantByBarcode(barcode || ""),
		queryFn: () => productsApi.getVariantByBarcode(barcode!),
		enabled: !!barcode && enabled,
		staleTime: 1000 * 60 * 10,
		retry: false, // Don't retry for barcode lookups
	});
};

export const useVariantById = (id: string | null, enabled = true) => {
	return useQuery({
		queryKey: PRODUCT_KEYS.variant(id || ""),
		queryFn: () => productsApi.getVariantById(id!),
		enabled: !!id && enabled,
		staleTime: 1000 * 60 * 10,
	});
};

export const useAllProducts = (
	params?: Omit<ProductFilterParams, "search">,
) => {
	return useQuery({
		queryKey: PRODUCT_KEYS.list(params || {}),
		queryFn: () => productsApi.getAll(params),
		staleTime: 1000 * 60 * 5,
	});
};

export const useProductInvalidate = () => {
	const queryClient = useQueryClient();

	return {
		invalidateAll: () =>
			queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all }),
		invalidateList: () =>
			queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.lists() }),
		invalidateDetail: (id: string) =>
			queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(id) }),
	};
};

export { PRODUCT_KEYS };
