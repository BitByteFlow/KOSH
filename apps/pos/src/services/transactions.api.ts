/**
 * Account Transactions API Service
 * Handles all account transaction-related API calls
 */

import apiClient from '../lib/apiClient';
import type {
  CreateTransactionRequest,
  AccountTransaction,
  TransactionListResponse,
  TransactionFilters,
} from '../types/api';

export const transactionsApi = {
  /**
   * Create a new account transaction
   * POST /transactions
   */
  create: async (transactionData: CreateTransactionRequest): Promise<AccountTransaction> => {
    const response = await apiClient.post<AccountTransaction>('/transactions', transactionData);
    return response.data;
  },

  /**
   * Get transaction by ID
   * GET /transactions/:id
   */
  getById: async (id: string): Promise<AccountTransaction> => {
    const response = await apiClient.get<AccountTransaction>(`/transactions/${id}`);
    return response.data;
  },

  /**
   * Get all transactions (paginated with filters)
   * GET /transactions
   */
  getAll: async (filters?: TransactionFilters): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse>('/transactions', { params: filters });
    return response.data;
  },

  /**
   * Get transactions for a specific store
   * GET /transactions/store/:storeId
   */
  getByStore: async (storeId: string, filters?: TransactionFilters): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse>(`/transactions/store/${storeId}`, {
      params: filters,
    });
    return response.data;
  },

  /**
   * Get today's transactions
   * GET /transactions/today
   */
  getTodayTransactions: async (): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse>('/transactions/today');
    return response.data;
  },

  /**
   * Get transactions by type
   * GET /transactions/type/:type
   */
  getByType: async (type: string, filters?: TransactionFilters): Promise<TransactionListResponse> => {
    const response = await apiClient.get<TransactionListResponse>(`/transactions/type/${type}`, {
      params: filters,
    });
    return response.data;
  },
};

export default transactionsApi;
