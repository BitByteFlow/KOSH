/**
 * React Query Hooks for Sales
 * Provides type-safe data fetching, caching, and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesApi } from '../services/sales.api';
import type { CreateSaleRequest, SaleFilters } from '../types/api';
import { toast } from 'sonner';

const SALE_KEYS = {
  all: ['sales'] as const,
  lists: () => [...SALE_KEYS.all, 'list'] as const,
  list: (filters?: SaleFilters) => [...SALE_KEYS.lists(), filters] as const,
  details: () => [...SALE_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...SALE_KEYS.details(), id] as const,
  today: () => [...SALE_KEYS.all, 'today'] as const,
  store: (storeId: string) => [...SALE_KEYS.all, 'store', storeId] as const,
};

/**
 * Hook to get sale by ID
 */
export const useSaleById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: SALE_KEYS.detail(id),
    queryFn: () => salesApi.getById(id),
    enabled: !!id && enabled,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * Hook to get all sales with filters
 */
export const useAllSales = (filters?: SaleFilters) => {
  return useQuery({
    queryKey: SALE_KEYS.list(filters),
    queryFn: () => salesApi.getAll(filters),
    staleTime: 1000 * 30, // 30 seconds for sales data
  });
};

/**
 * Hook to get today's sales
 */
export const useTodaySales = () => {
  return useQuery({
    queryKey: SALE_KEYS.today(),
    queryFn: () => salesApi.getTodaySales(),
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to get sales by store
 */
export const useSalesByStore = (storeId: string, filters?: SaleFilters) => {
  return useQuery({
    queryKey: SALE_KEYS.store(storeId),
    queryFn: () => salesApi.getByStore(storeId, filters),
    enabled: !!storeId,
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to create a new sale
 */
export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (saleData: CreateSaleRequest) => salesApi.create(saleData),
    onSuccess: (data) => {
      // Invalidate sales list queries to refresh data
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.today() });
      
      toast.success(`Sale #${data.id.slice(0, 8)} completed successfully!`);
    },
    onError: (error: any) => {
      const message = error?.response?.message || error?.message || 'Failed to create sale';
      toast.error(message);
    },
  });
};

/**
 * Hook to void a sale
 */
export const useVoidSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => salesApi.void(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: SALE_KEYS.lists() });
      toast.success('Sale voided successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.message || error?.message || 'Failed to void sale';
      toast.error(message);
    },
  });
};

/**
 * Hook to invalidate sales cache
 */
export const useSaleInvalidate = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: SALE_KEYS.all }),
    invalidateList: () => queryClient.invalidateQueries({ queryKey: SALE_KEYS.lists() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: SALE_KEYS.detail(id) }),
    invalidateToday: () => queryClient.invalidateQueries({ queryKey: SALE_KEYS.today() }),
  };
};

export { SALE_KEYS };
