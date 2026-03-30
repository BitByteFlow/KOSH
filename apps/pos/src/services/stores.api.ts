import apiClient from "../lib/apiClient";
import type { Store, StoreResponse } from "../types/api";

export const storesApi = {
	getById: async (id: string): Promise<Store> => {
		const response = await apiClient.get<StoreResponse>(`/stores/${id}`);
		return response.data;
	},

	getAll: async (): Promise<Store[]> => {
		const response = await apiClient.get<Store[]>("/stores");
		return response.data;
	},

	getMyStore: async (): Promise<Store> => {
		const response = await apiClient.get<StoreResponse>("/stores/my-store");
		return response.data;
	},

	update: async (id: string, data: Partial<Store>): Promise<Store> => {
		const response = await apiClient.put<StoreResponse>(`/stores/${id}`, data);
		return response.data;
	},
};

export default storesApi;
