import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export interface DashboardMetrics {
	openingCash: string;
	closingCash: string;
	totalSales: string;
	totalExpense: string;
	totalCashIn: string;
	totalCashOut: string;
}

export interface CreateTransactionRequest {
	type: "OPENING_CASH" | "WITHDRAW" | "EXPENSE";
	amount: number;
	note: string;
}

export interface Transaction {
	id: string;
	type: string;
	amount: number;
	note: string;
	createdAt: string;
}

export const accountService = {
	getDashboardMetrics: async (): Promise<DashboardMetrics> => {
		return apiClient.get<DashboardMetrics>(API_ENDPOINTS.account.balance);
	},

	createTransaction: async (data: CreateTransactionRequest): Promise<Transaction> => {
		return apiClient.post<Transaction>(API_ENDPOINTS.account.transactions, data);
	},
};