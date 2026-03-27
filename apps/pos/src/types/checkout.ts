import type { Product, ProductVariant } from "./index";

export interface CustomerFormData {
	name: string;
	email: string;
	contact: string;
}

export interface CustomerFormErrors {
	name?: string;
	email?: string;
	contact?: string;
}

export interface CheckoutState {
	isScanning: boolean;
	isSearching: boolean;
	scannedBarcode: string | null;
	selectedProduct: Product | null;
	isVariantModalOpen: boolean;
	isCreditModalOpen: boolean;
}

export interface CheckoutActions {
	setIsScanning: (value: boolean) => void;
	setIsSearching: (value: boolean) => void;
	setScannedBarcode: (value: string | null) => void;
	setSelectedProduct: (product: Product | null) => void;
	setIsVariantModalOpen: (value: boolean) => void;
	setIsCreditModalOpen: (value: boolean) => void;
	handleProductSelect: (product: Product) => void;
	handleVariantSelect: (variant: ProductVariant, productName: string) => void;
	handleScanComplete: (code: string) => void;
}

export type CheckoutHook = CheckoutState & CheckoutActions;
