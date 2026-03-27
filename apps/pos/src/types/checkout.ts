import type { Dispatch, SetStateAction } from "react";
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
	setIsScanning: Dispatch<SetStateAction<boolean>>;
	setIsSearching: Dispatch<SetStateAction<boolean>>;
	setScannedBarcode: Dispatch<SetStateAction<string | null>>;
	setSelectedProduct: Dispatch<SetStateAction<Product | null>>;
	setIsVariantModalOpen: Dispatch<SetStateAction<boolean>>;
	setIsCreditModalOpen: Dispatch<SetStateAction<boolean>>;
	handleProductSelect: (product: Product) => void;
	handleVariantSelect: (variant: ProductVariant, productName: string) => void;
	handleScanComplete: (code: string) => void;
}

export type CheckoutHook = CheckoutState & CheckoutActions;
