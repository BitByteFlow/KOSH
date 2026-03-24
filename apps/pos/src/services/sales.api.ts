import apiClient from "../lib/apiClient";
import type {
	CreateSaleRequest,
	Sale,
	SaleListResponse,
	SaleFilters,
} from "../types/api";

export const salesApi = {
	create: async (saleData: CreateSaleRequest): Promise<Sale> => {
		const response = await apiClient.post<Sale>("/sales", saleData);
		return response.data;
	},

	getById: async (id: string): Promise<Sale> => {
		const response = await apiClient.get<Sale>(`/sales/${id}`);
		return response.data;
	},

	getAll: async (filters?: SaleFilters): Promise<Sale[]> => {
		const response = await apiClient.get<Sale[]>("/sales", {
			params: filters as unknown as
				| Record<string, string | number | boolean | undefined>
				| undefined,
		});
		return response.data;
	},

	getByStore: async (
		storeId: string,
		filters?: SaleFilters,
	): Promise<SaleListResponse> => {
		const response = await apiClient.get<SaleListResponse>(
			`/sales/store/${storeId}`,
			{
				params: filters as unknown as
					| Record<string, string | number | boolean | undefined>
					| undefined,
			},
		);
		return response.data;
	},
	getTodaySales: async (): Promise<SaleListResponse> => {
		const response = await apiClient.get<SaleListResponse>("/sales/today");
		return response.data;
	},

	void: async (id: string, reason?: string): Promise<Sale> => {
		const response = await apiClient.post<Sale>(`/sales/${id}/void`, {
			reason,
		});
		return response.data;
	},
};

export default salesApi;
