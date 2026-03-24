/**
 * API Services Index
 * Central export for all API services
 */

export { productsApi } from './products.api';
export { salesApi } from './sales.api';
export { transactionsApi } from './transactions.api';
export { storesApi } from './stores.api';

// Re-export apiClient for custom requests
export { apiClient, ApiClient } from '../lib/apiClient';
export type { ApiResponse, ApiError, RequestConfig } from '../lib/apiClient';
