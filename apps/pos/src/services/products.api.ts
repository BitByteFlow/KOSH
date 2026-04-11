import type { Product } from "@/types";
import apiClient from "../lib/apiClient";
import type {
	ProductFilterParams,
	ProductListResponse,
	ProductVariantResponse,
} from "../types/api";

export const productsApi = {
	search: async (params: ProductFilterParams): Promise<ProductListResponse> => {
		const response = await apiClient.get<Product[]>(
			"/products/search",
			{
				params: params as unknown as
					| Record<string, string | number | boolean | undefined>
					| undefined,
			},
		);

		return {
			data: response.data || [],
			total: response.meta?.total || 0,
			page: response.meta?.page || params.page || 1,
			limit: response.meta?.limit || params.limit || 10,
			totalPages: response.meta?.totalPages || 0,
		};
	},

	getById: async (id: string): Promise<ProductListResponse["data"][0]> => {
		const response = await apiClient.get<Product[]>(`/products/${id}`);
		return response.data?.[0] || null;
	},

	getVariantByBarcode: async (
		barcode: string,
	): Promise<ProductVariantResponse | null> => {
		const response = await apiClient.get<Product[]>(
			`/products/variant/${encodeURIComponent(barcode)}`,
		);

		const product = response.data?.[0];
		if (!product) {
			return null;
		}

		// The API now returns only the matching variant in the variants array
		const variant = product.variants?.[0];
		if (variant) {
			return {
				id: variant.id,
				sku: variant.sku,
				barcode: variant.barcode,
				sellingPrice: variant.sellingPrice,
				costPrice: variant.costPrice,
				stock: variant.stock,
				status: variant.status,
				product: { id: product.id, name: product.productName },
			};
		}
		return null;
	},

	getVariantById: async (
		id: string,
	): Promise<ProductVariantResponse | null> => {
		const response = await apiClient.get<Product[]>(
			`/products/variant/id/${id}`,
		);

		for (const product of response.data || []) {
			const variant = product.variants?.find((v: any) => v.id === id);
			if (variant) {
				return {
					...variant,
					product: { id: product.id, name: product.productName },
				};
			}
		}
		return null;
	},

	getAll: async (
		params?: Omit<ProductFilterParams, "search">,
	): Promise<ProductListResponse> => {
		const response = await apiClient.get<Product[]>("/products", {
			params,
		});

		return {
			data: response.data || [],
			total: response.meta?.total || 0,
			page: response.meta?.page || params?.page || 1,
			limit: response.meta?.limit || params?.limit || 10,
			totalPages: response.meta?.totalPages || 0,
		};
	},
};

export default productsApi;
