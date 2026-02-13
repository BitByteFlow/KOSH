import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface Category {
	id: string;
	name: string;
}

export const categoriesService = {
	getCategories: async (
		token: string | undefined,
	): Promise<{ categories: Category[] }> => {
		const response = await clientApiClient.get<{ data: Category[] }>(
			API_ENDPOINTS.categories.list,
			token,
		);
		return { categories: response.data };
	},
};
