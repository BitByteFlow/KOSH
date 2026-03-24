# KOSH POS - REST API Implementation Guide

## Overview

This document describes the production-ready REST API implementation for KOSH POS, replacing the previous GraphQL-based approach.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Components                        │
├─────────────────────────────────────────────────────────────┤
│                    React Query Hooks                         │
│  (useProductSearch, useCreateSale, useAllTransactions, etc.) │
├─────────────────────────────────────────────────────────────┤
│                      API Services                            │
│     (productsApi, salesApi, transactionsApi, storesApi)      │
├─────────────────────────────────────────────────────────────┤
│                    Generic API Client                        │
│            (ApiClient with interceptors & error handling)    │
├─────────────────────────────────────────────────────────────┤
│                       REST API                               │
│                  (http://localhost:4000)                     │
└─────────────────────────────────────────────────────────────┘
```

## Key Features

### 1. Generic API Client (`src/lib/apiClient.ts`)

- **Type-safe** requests and responses
- **Automatic authentication** via Bearer token from localStorage
- **Request cancellation** support
- **Timeout handling** (default: 30s)
- **Centralized error handling**
- **HTTP method shortcuts** (get, post, put, patch, delete)

```typescript
import apiClient from '@/lib/apiClient';

// GET request with params
const response = await apiClient.get<ProductListResponse>('/products', {
  params: { search: 'item', page: 1, limit: 10 }
});

// POST request with body
const result = await apiClient.post<Sale>('/sales', saleData);
```

### 2. API Services (`src/services/`)

Organized by resource:
- `products.api.ts` - Product search, variants, barcode lookup
- `sales.api.ts` - Create sales, get sales history, void sales
- `transactions.api.ts` - Account transactions management
- `stores.api.ts` - Store details and management

```typescript
import { productsApi } from '@/services/products.api';

// Search products
const products = await productsApi.search({
  search: 'barcode123',
  page: 1,
  limit: 10
});

// Get variant by barcode
const variant = await productsApi.getVariantByBarcode('123456789');
```

### 3. React Query Hooks (`src/hooks/`)

Provides data fetching, caching, and state management:

#### Product Hooks
- `useProductSearch(params, enabled)` - Search products with filters
- `useProductById(id, enabled)` - Get single product
- `useVariantByBarcode(barcode, enabled)` - Lookup by barcode
- `useAllProducts(params)` - Get all products (paginated)
- `useProductInvalidate()` - Cache invalidation utilities

#### Sales Hooks
- `useAllSales(filters)` - Get sales with filters
- `useCreateSale()` - Create new sale (with auto toast)
- `useTodaySales()` - Get today's sales
- `useSalesByStore(storeId, filters)` - Get sales by store
- `useVoidSale()` - Void/cancel a sale

#### Transaction Hooks
- `useAllTransactions(filters)` - Get transactions
- `useCreateTransaction()` - Create transaction (with auto toast)
- `useTodayTransactions()` - Get today's transactions
- `useTransactionsByStore(storeId, filters)` - Filter by store

### 4. Type Definitions (`src/types/api.ts`)

Comprehensive TypeScript types for:
- API responses (standardized format)
- Request parameters
- Entity models (Product, Sale, Transaction, etc.)
- Filter and pagination options

## Usage Examples

### Product Search Component

```typescript
import { useProductSearch } from '@/hooks/useProducts';

function ProductSearch({ searchTerm }) {
  const { data, isLoading, error } = useProductSearch(
    { search: searchTerm, page: 1, limit: 10 },
    !!searchTerm // enabled only when searchTerm exists
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {data?.data.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Create Sale with Mutation

```typescript
import { useCreateSale } from '@/hooks/useSales';

function CheckoutPage() {
  const createSale = useCreateSale();

  const handleCheckout = async (paymentType) => {
    try {
      await createSale.mutateAsync({
        total: 100,
        discount: 0,
        profit: 0,
        paymentType,
        items: cartItems.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          sellPrice: item.price,
          costPrice: 0,
        })),
      });
      // Success toast is automatic
      clearCart();
    } catch (error) {
      // Error toast is automatic
    }
  };

  return (
    <Button
      disabled={createSale.isPending}
      onClick={() => handleCheckout('CASH')}
    >
      {createSale.isPending ? 'Processing...' : 'Checkout'}
    </Button>
  );
}
```

## API Response Format

All API responses follow a standardized format:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

## Error Handling

Errors are automatically caught and displayed via toast notifications. The API client creates structured error objects:

```typescript
interface ApiError extends Error {
  status?: number;
  statusText?: string;
  response?: ApiResponse<unknown>;
  endpoint?: string;
  method?: HttpMethod;
}
```

## Authentication

Authentication is handled automatically:
- Token is retrieved from `localStorage` key `kosh_pos_token`
- Bearer token is added to all requests via Authorization header
- No need to manually pass tokens in components

## Environment Variables

```env
# Required: Base URL of the REST API
VITE_API_URL=http://localhost:4000

# Optional: Google OAuth (for login)
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

## Migration from GraphQL

### Before (GraphQL)
```typescript
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

const GET_PRODUCTS = gql`
  query ListProductsWithFilter($filterInput: ProductFilterInput!) {
    listProductsWithFilter(filterInput: $filterInput) {
      success
      message
      data { id, productName, variants { ... } }
    }
  }
`;

function Component() {
  const { data, loading } = useQuery(GET_PRODUCTS, {
    variables: { filterInput: { search: 'item', page: 1, limit: 10 } }
  });
  
  const products = data?.listProductsWithFilter?.data || [];
}
```

### After (REST)
```typescript
import { useProductSearch } from '@/hooks/useProducts';

function Component() {
  const { data, isLoading } = useProductSearch({
    search: 'item',
    page: 1,
    limit: 10
  });
  
  const products = data?.data || [];
}
```

## Benefits

1. **Simpler Code**: No GraphQL queries/mutations to maintain
2. **Better Caching**: React Query's intelligent caching
3. **Automatic Refetch**: Window focus, reconnection, etc.
4. **Type Safety**: Full TypeScript support end-to-end
5. **Smaller Bundle**: Removed Apollo Client dependency
6. **Standard HTTP**: Easier to debug and test
7. **Optimistic Updates**: Built-in support for UI updates

## Testing

```bash
# Run type checking
bun run type-check

# Run linting
bun run lint

# Start development server
bun run dev
```

## Future Enhancements

- [ ] Add request/response interceptors for logging
- [ ] Implement retry logic with exponential backoff
- [ ] Add offline support with React Query persistence
- [ ] Create mock API handlers for development
- [ ] Add API response caching at service layer
