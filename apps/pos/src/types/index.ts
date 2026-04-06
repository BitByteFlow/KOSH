export interface Product {
	id: string;
	productName: string;
	description?: string;
	variants: ProductVariant[];
	variantCount?: number;
	totalStock?: number;
	category?: {
		id: string;
		name: string;
	};
}

export interface ProductVariant {
	id: string;
	sku: string;
	barcode: string;
	sellingPrice: number;
	costPrice: number;
	stock: number;
	attributes?: Array<{
		id: string;
		name: string;
		value: string;
	}>;
	product: {
		name: string
	}
}

export interface SaleItemInput {
	variantId: string;
	quantity: number;
	sellPrice: number;
	costPrice: number;
}

export interface CreateSaleInput {
	total: number;
	discount: number;
	profit: number;
	paymentType: "CASH" | "ONLINE" | "CREDIT";
	userId?: string;
	storeId?: string;
	items: SaleItemInput[];
}

export * from "./api";
