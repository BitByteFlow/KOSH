import { gql } from "@apollo/client";
import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export const GET_CURRENT_CASH_BALANCE = gql`
  query GetCurrentCashBalance {
    getCurrentCashBalance {
      success
      message
      data {
        openingCash
        closingCash
        totalSales
        totalExpense
        totalCashIn
        totalCashOut
      }
    }
  }
`;

export const GET_ACCOUNT_TRANSACTIONS = gql`
  query GetAccountTransactions($page: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
    getAccountTransactions(page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
      success
      message
      data {
        id
        type
        amount
        note
        createdAt
        updatedAt
      }
      meta {
        total
        page
        limit
        totalPages
        hasNext
        hasPrev
      }
    }
  }
`;

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(createTransactionInput: $input) {
      success
      message
      data {
        id
        type
        amount
        note
        createdAt
        updatedAt
      }
    }
  }
`;

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
	amount: string;
	note: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface PaginationMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export interface PaginatedTransactions {
	data: Transaction[];
	meta: PaginationMeta;
}

export interface GetTransactionsParams {
	page?: number;
	limit?: number;
	sortBy?: "createdAt" | "amount" | "type";
	sortOrder?: "asc" | "desc";
}

export const accountService = {
	getDashboardMetrics: async (token: string | undefined): Promise<DashboardMetrics> => {
		return clientApiClient.get<DashboardMetrics>(API_ENDPOINTS.account.balance, token);
	},

	createTransaction: async (data: CreateTransactionRequest, token: string | undefined): Promise<Transaction> => {
		return clientApiClient.post<Transaction>(API_ENDPOINTS.account.transactions, token, data);
	},

	getAccountTransactions: async (
		params: GetTransactionsParams,
		token: string | undefined
	): Promise<PaginatedTransactions> => {
		return clientApiClient.get<PaginatedTransactions>(
			API_ENDPOINTS.account.transactions,
			token,
			{ params: params as any }
		);
	},
};