/**
 * React Query Hooks Index
 * Central export for all data fetching hooks
 */

// Product hooks
export {
  useProductSearch,
  useInfiniteProductSearch,
  useProductById,
  useVariantByBarcode,
  useVariantById,
  useAllProducts,
  useProductInvalidate,
  PRODUCT_KEYS,
} from './useProducts';

// Sales hooks
export {
  useSaleById,
  useAllSales,
  useTodaySales,
  useSalesByStore,
  useCreateSale,
  useVoidSale,
  useSaleInvalidate,
  SALE_KEYS,
} from './useSales';

// Transactions hooks
export {
  useTransactionById,
  useAllTransactions,
  useTodayTransactions,
  useTransactionsByStore,
  useTransactionsByType,
  useCreateTransaction,
  useTransactionInvalidate,
  TRANSACTION_KEYS,
} from './useTransactions';
