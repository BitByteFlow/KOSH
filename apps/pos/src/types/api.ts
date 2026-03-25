import type { Product, ProductVariant, CreateSaleInput } from "./index";

export interface ApiListResponse<T> {
	data: T[];
	// meta: {
	// 	total: number;
	// 	hasNext: number;
	// 	hasPrev: number;
	// 	page: number;
	// 	limit: number;
	// 	totalPages: number;
	// };
}

export interface ProductFilterParams {
	search?: string;
	page?: number;
	limit?: number;
	category?: string;
	minPrice?: number;
	maxPrice?: number;
	inStock?: boolean;
}

export interface ProductListResponse extends ApiListResponse<Product> {}

export interface ProductVariantResponse extends ProductVariant {}

export interface SaleItem {
	id: string;
	quantity: number;
	sellPrice: number;
	costPrice: number;
	variantId: string;
	variant?: ProductVariant;
}

export interface Sale {
	id: string;
	total: number;
	discount: number;
	profit: number;
	paymentType: "CASH" | "ONLINE" | "CREDIT";
	userId: string;
	storeId: string;
	items: SaleItem[];
	createdAt: string;
	updatedAt: string;
}

export interface CreateSaleRequest extends Omit<
	CreateSaleInput,
	"userId" | "storeId"
> {}

export interface SaleListResponse extends ApiListResponse<Sale> {}

export interface SaleFilters {
	startDate?: string;
	endDate?: string;
	paymentType?: "CASH" | "ONLINE" | "CREDIT";
	page?: number;
	limit?: number;
}

export type TransactionType =
	| "WITHDRAWAL"
	| "EXPENSES"
	| "CREDIT"
	| "PURCHASE"
	| "ADJUSTMENT";

export interface AccountTransaction {
	id: string;
	type: TransactionType;
	amount: number;
	note?: string;
	storeId: string;
	userId: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTransactionRequest {
	type: TransactionType;
	amount: number;
	note?: string;
}

export interface TransactionListResponse extends ApiListResponse<AccountTransaction> {}

export interface TransactionFilters {
	type?: TransactionType;
	startDate?: string;
	endDate?: string;
	page?: number;
	limit?: number;
}

export interface Store {
	id: string;
	name: string;
	address?: string;
	phone?: string;
	email?: string;
	createdAt: string;
	updatedAt: string;
}

export interface StoreResponse extends Store {}

export interface DashboardStats {
	totalSales: number;
	totalTransactions: number;
	todaySales: number;
	todayTransactions: number;
	topProducts: Array<{
		productId: string;
		productName: string;
		quantitySold: number;
		revenue: number;
	}>;
}
