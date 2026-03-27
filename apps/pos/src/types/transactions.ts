export interface Transaction {
	id: string;
	total: number;
	discount: number;
	profit: number;
	paymentType: "CASH" | "ONLINE" | "CREDIT";
	userId: string;
	storeId: string;
	items: TransactionItem[];
	createdAt: string;
	updatedAt: string;
	customerName?: string;
	customerEmail?: string;
	customerContact?: string;
}

export interface TransactionItem {
	id: string;
	quantity: number;
	sellPrice: number;
	costPrice: number;
	variantId: string;
	variant?: {
		id: string;
		sku: string;
		barcode: string;
	};
}

export interface TransactionsFilter {
	search: string;
	paymentType?: "CASH" | "ONLINE" | "CREDIT" | "ALL";
	dateRange?: {
		start: string;
		end: string;
	};
}

export interface TransactionsState {
	searchTerm: string;
	selectedPaymentType: "CASH" | "ONLINE" | "CREDIT" | "ALL";
	isLoading: boolean;
	isError: boolean;
	isSuccess: boolean;
}

export interface TransactionsActions {
	setSearchTerm: (term: string) => void;
	setSelectedPaymentType: (type: "CASH" | "ONLINE" | "CREDIT" | "ALL") => void;
	refetch: () => void;
}

export type TransactionsHook = TransactionsState &
	TransactionsActions & {
		transactions: Transaction[];
		filteredTransactions: Transaction[];
		totalRevenue: number;
		totalTransactions: number;
	};
