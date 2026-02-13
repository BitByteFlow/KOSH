import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface ProductVariant {
	id: string;
	sku: string;
	barcode: string;
	attributes: Record<string, string>;
	price: number;
	stock: number;
	lowStock: boolean;
	status: string;
}

export interface Product {
	id: string;
	productName: string;
	category: string;
	totalStock: number;
	variantCount: number;
	status: "active" | "inactive" | "out-of-stock";
	variants: ProductVariant[];
}

export interface PaginatedProducts {
	data: Product[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
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
