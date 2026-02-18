import { Status } from "@/gql/graphql";
import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface ProductVariant {
	id: string;
	sku: string;
	barcode: string;
	attributes: { name: string; value: string }[];
	price: number;
	stock: number;
	lowStock: boolean;
	status: string;
	sellPrice: number;
	costPrice: number;
}

export interface Product {
	id: string;
	productName: string;
	category: string;
	totalStock: number;
	variantCount: number;
	status: Status 
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
		params?: { 
			search?: string; 
			limit?: number; 
			page?: number; 
			categoryId?: string; 
			status?: string 
		}
	): Promise<PaginatedProducts> => {
		const cleanParams = Object.fromEntries(
			Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== "undefined")
		);
		
		return clientApiClient.get<PaginatedProducts>(API_ENDPOINTS.products.list, token, {
			params: cleanParams as any,
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

	updateProduct: async (
		id: string,
		data: any,
		token: string | undefined
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.patch<{ status: string; message: string }>(
			API_ENDPOINTS.products.update(id),
			token,
			data
		);
	},

	deleteProduct: async (
		id: string,
		token: string | undefined
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.delete<{ status: string; message: string }>(
			API_ENDPOINTS.products.delete(id),
			token
		);
	},

	updateVariant: async (
		productId: string,
		variantId: string,
		data: any,
		token: string | undefined
	): Promise<{ status: string; message: string }> => {
		return clientApiClient.put<{ status: string; message: string }>(
			API_ENDPOINTS.products.updateVariant(variantId),
			token,
			{ ...data, productId, variantId }
		);
	},
};
