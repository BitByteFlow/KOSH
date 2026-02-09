import { clientApiClient } from "@/lib/api/client";
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
	type: "INITIAL_CAPITAL" | "WITHDRAWAL" | "ADDITIONAL_CAPITAL" | "SALE_INCOME" | "PURCHASE" | "DEBT_PAID" | "CREDIT_RECEIVED" | "EXPENSES" | "DEBT";
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
	getDashboardMetrics: async (token: string | undefined): Promise<DashboardMetrics> => {
		return clientApiClient.get<DashboardMetrics>(API_ENDPOINTS.account.balance, token);
	},

	createTransaction: async (data: CreateTransactionRequest, token: string | undefined): Promise<Transaction> => {
		return clientApiClient.post<Transaction>(API_ENDPOINTS.account.transactions, token, data);
	},
};