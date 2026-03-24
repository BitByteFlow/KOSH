/**
 * React Query Hooks for Account Transactions
 * Provides type-safe data fetching, caching, and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../services/transactions.api';
import type { CreateTransactionRequest, TransactionFilters } from '../types/api';
import { toast } from 'sonner';

const TRANSACTION_KEYS = {
  all: ['transactions'] as const,
  lists: () => [...TRANSACTION_KEYS.all, 'list'] as const,
  list: (filters?: TransactionFilters) => [...TRANSACTION_KEYS.lists(), filters] as const,
  details: () => [...TRANSACTION_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TRANSACTION_KEYS.details(), id] as const,
  today: () => [...TRANSACTION_KEYS.all, 'today'] as const,
  store: (storeId: string) => [...TRANSACTION_KEYS.all, 'store', storeId] as const,
  byType: (type: string) => [...TRANSACTION_KEYS.all, 'type', type] as const,
};

/**
 * Hook to get transaction by ID
 */
export const useTransactionById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: TRANSACTION_KEYS.detail(id),
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get all transactions with filters
 */
export const useAllTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: TRANSACTION_KEYS.list(filters),
    queryFn: () => transactionsApi.getAll(filters),
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to get today's transactions
 */
export const useTodayTransactions = () => {
  return useQuery({
    queryKey: TRANSACTION_KEYS.today(),
    queryFn: () => transactionsApi.getTodayTransactions(),
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to get transactions by store
 */
export const useTransactionsByStore = (storeId: string, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: TRANSACTION_KEYS.store(storeId),
    queryFn: () => transactionsApi.getByStore(storeId, filters),
    enabled: !!storeId,
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to get transactions by type
 */
export const useTransactionsByType = (type: string, filters?: TransactionFilters) => {
  return useQuery({
    queryKey: TRANSACTION_KEYS.byType(type),
    queryFn: () => transactionsApi.getByType(type, filters),
    enabled: !!type,
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to create a new transaction
 */
export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transactionData: CreateTransactionRequest) =>
      transactionsApi.create(transactionData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.today() });
      
      toast.success(`Transaction #${data.id.slice(0, 8)} created successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || error?.message || 'Failed to create transaction';
      toast.error(message);
    },
  });
};

/**
 * Hook to invalidate transactions cache
 */
export const useTransactionInvalidate = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.lists() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.detail(id) }),
    invalidateToday: () => queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.today() }),
  };
};

export { TRANSACTION_KEYS };
