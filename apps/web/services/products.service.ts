import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface ProductVariant {
	id: string;
	name: string;
	sku: string;
	stock: number;
	costPrice: string;
	sellPrice: string;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	categoryId: string;
	variants: ProductVariant[];
}

export interface PaginatedProducts {
	data: Product[];
	meta: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export const productsService = {
	getProducts: async (
		token: string | undefined,
		params?: { search?: string; limit?: number }
	): Promise<PaginatedProducts> => {
		return clientApiClient.get<PaginatedProducts>(API_ENDPOINTS.products.list, token, {
			params: params as any,
		});
	},

	createProduct: async (
		data: any,
		token: string | undefined
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.post<{ status: string; message: string }>(
			API_ENDPOINTS.products.create,
			token,
			data
		);
	},
};
