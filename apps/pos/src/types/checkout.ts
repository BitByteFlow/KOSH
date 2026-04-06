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
	selectedProduct: Product | null;
	isVariantModalOpen: boolean;
	isCreditModalOpen: boolean;
}

export interface CheckoutActions {
	setIsScanning: Dispatch<SetStateAction<boolean>>;
	setIsSearching: Dispatch<SetStateAction<boolean>>;
	setSelectedProduct: Dispatch<SetStateAction<Product | null>>;
	setIsVariantModalOpen: Dispatch<SetStateAction<boolean>>;
	setIsCreditModalOpen: Dispatch<SetStateAction<boolean>>;
	handleProductSelect: (product: Product) => void;
	handleVariantSelect: (variant: ProductVariant, productName: string) => void;
	handleScanComplete: (barcode: string) => Promise<void>;
	handleSearchToggle: () => void;
}

export type CheckoutHook = CheckoutState & CheckoutActions;
