/**
 * Stores API Service
 * Handles all store-related API calls
 */

import apiClient from '../lib/apiClient';
import type { Store, StoreResponse } from '../types/api';

export const storesApi = {
  /**
   * Get store by ID
   * GET /stores/:id
   */
  getById: async (id: string): Promise<Store> => {
    const response = await apiClient.get<StoreResponse>(`/stores/${id}`);
    return response.data;
  },

  /**
   * Get all stores (for multi-store setups)
   * GET /stores
   */
  getAll: async (): Promise<Store[]> => {
    const response = await apiClient.get<Store[]>('/stores');
    return response.data;
  },

  /**
   * Get current authenticated user's store
   * GET /stores/my-store
   */
  getMyStore: async (): Promise<Store> => {
    const response = await apiClient.get<StoreResponse>('/stores/my-store');
    return response.data;
  },

  /**
   * Update store details
   * PUT /stores/:id
   */
  update: async (id: string, data: Partial<Store>): Promise<Store> => {
    const response = await apiClient.put<StoreResponse>(`/stores/${id}`, data);
    return response.data;
  },
};

export default storesApi;
