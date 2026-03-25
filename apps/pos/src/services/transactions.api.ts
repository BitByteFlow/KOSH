import apiClient from "../lib/apiClient";
import type {
	CreateTransactionRequest,
	AccountTransaction,
	TransactionListResponse,
	TransactionFilters,
} from "../types/api";

export const transactionsApi = {
	create: async (
		transactionData: CreateTransactionRequest,
	): Promise<AccountTransaction> => {
		const response = await apiClient.post<AccountTransaction>(
			"/transactions",
			transactionData,
		);
		return response.data;
	},

	getById: async (id: string): Promise<AccountTransaction> => {
		const response = await apiClient.get<AccountTransaction>(
			`/transactions/${id}`,
		);
		return response.data;
	},

	getAll: async (
		filters?: TransactionFilters,
	): Promise<AccountTransaction[]> => {
		const response = await apiClient.get<AccountTransaction[]>(
			"/accounts/transactions",
			{
				params: filters as unknown as Record<
					string,
					string | undefined | number
				>,
			},
		);
		return response.data;
	},

	getByStore: async (
		storeId: string,
		filters?: TransactionFilters,
	): Promise<TransactionListResponse> => {
		const response = await apiClient.get<TransactionListResponse>(
			`/transactions/store/${storeId}`,
			{
				params: filters as unknown as Record<
					string,
					string | undefined | number
				>,
			},
		);
		return response.data;
	},

	getTodayTransactions: async (): Promise<TransactionListResponse> => {
		const response = await apiClient.get<TransactionListResponse>(
			"/transactions/today",
		);
		return response.data;
	},

	getByType: async (
		type: string,
		filters?: TransactionFilters,
	): Promise<TransactionListResponse> => {
		const response = await apiClient.get<TransactionListResponse>(
			`/transactions/type/${type}`,
			{
				params: filters as unknown as Record<
					string,
					string | undefined | number
				>,
			},
		);
		return response.data;
	},
};

export default transactionsApi;
