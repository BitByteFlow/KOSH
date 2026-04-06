import apiClient from "../lib/apiClient";
import type {
	ProductFilterParams,
	ProductListResponse,
	ProductVariantResponse,
} from "../types/api";

interface ApiProductResponse {
	success: boolean;
	message: string;
	data: any[];
	meta?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

export const productsApi = {
	search: async (params: ProductFilterParams): Promise<ProductListResponse> => {
		const response = await apiClient.get<ApiProductResponse>(
			"/products/search",
			{
				params: params as unknown as
					| Record<string, string | number | boolean | undefined>
					| undefined,
			},
		);

		return {
			data: response.data.data || [],
			total: response.data.meta?.total || 0,
			page: response.data.meta?.page || params.page || 1,
			limit: response.data.meta?.limit || params.limit || 10,
			totalPages: response.data.meta?.totalPages || 0,
		};
	},

	getById: async (id: string): Promise<ProductListResponse["data"][0]> => {
		const response = await apiClient.get<ApiProductResponse>(`/products/${id}`);
		return response.data.data?.[0] || null;
	},

	getVariantByBarcode: async (
		barcode: string,
	): Promise<ProductVariantResponse | null> => {
		const response = await apiClient.get<ApiProductResponse>(
			`/products/variant/${encodeURIComponent(barcode)}`,
		);

		const product = response.data.data?.[0];
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
				product: { id: product.id, productName: product.productName },
			};
		}
		return null;
	},

	getVariantById: async (id: string): Promise<ProductVariantResponse | null> => {
		const response = await apiClient.get<ApiProductResponse>(
			`/products/variant/id/${id}`,
		);

		for (const product of response.data.data || []) {
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
		const response = await apiClient.get<ApiProductResponse>("/products", {
			params,
		});

		return {
			data: response.data.data || [],
			total: response.data.meta?.total || 0,
			page: response.data.meta?.page || params?.page || 1,
			limit: response.data.meta?.limit || params?.limit || 10,
			totalPages: response.data.meta?.totalPages || 0,
		};
	},
};

export default productsApi;
