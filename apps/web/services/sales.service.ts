import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface SaleItem {
	variantId: string;
	quantity: number;
	sellPrice: number;
	costPrice: number;
}

export interface CreateSaleRequest {
	discount: number;
	paymentType: "CASH" | "ONLINE" | "CREDIT";
	creditId?: string;
	items: SaleItem[];
	transactionNote?: string;
	customerName?: string;
	customerEmail?: string;
	customerContact?: string;
}

export interface SaleItemResponse {
	id: string;
	quantity: number;
	sellPrice: string;
	costPrice: string;
	variantId: string;
}

export interface Sale {
	id: string;
	total: string;
	discount: string;
	profit: string;
	paymentType: string;
	creditId: string | null;
	items: SaleItemResponse[];
	createdAt: string;
	updatedAt: string;
}

export interface SaleResponse {
	success: boolean;
	message?: string;
	data?: Sale[];
	totalCount?: number;
}

export interface SalesMetricsResponse {
	totalSales: number;
	totalTransactions: number;
	avgSaleValue: number;
	totalProfit: number;
}

export const salesService = {
	createSale: async (
		data: CreateSaleRequest,
		token: string | undefined
	): Promise<SaleResponse> => {
		return clientApiClient.post<SaleResponse>(API_ENDPOINTS.sales.create, token, data);
	},

	getSales: async (token: string | undefined): Promise<SaleResponse> => {
		return clientApiClient.get<SaleResponse>(API_ENDPOINTS.sales.list, token);
	},

	getSalesMetrics: async (token: string | undefined): Promise<SalesMetricsResponse> => {
		return clientApiClient.get<SalesMetricsResponse>(API_ENDPOINTS.sales.metrics, token);
	},
};
