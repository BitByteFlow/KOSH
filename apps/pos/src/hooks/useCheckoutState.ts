import { useState, useCallback } from "react";
import type { Product, ProductVariant } from "../types";
import type { CheckoutState, CheckoutActions } from "../types/checkout";
import { useCart } from "../store/useCart";
import { toast } from "sonner";

interface UseCheckoutStateOptions {
	onVariantSelect?: (variant: ProductVariant, productName: string) => void;
}

export const useCheckoutState = (
	options?: UseCheckoutStateOptions,
): CheckoutState & CheckoutActions => {
	const { addItem } = useCart();
	const [isScanning, setIsScanning] = useState<boolean>(false);
	const [isSearching, setIsSearching] = useState<boolean>(false);
	const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
	const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);

	const handleProductSelect = useCallback((product: Product) => {
		setSelectedProduct(product);
		setIsVariantModalOpen(true);
	}, []);

	const handleVariantSelect = useCallback(
		(variant: ProductVariant, productName: string) => {
			addItem({
				id: variant.id,
				name: productName,
				sku: variant.sku,
				price: variant.sellingPrice,
				variantId: variant.id,
				costPrice: variant.costPrice,
			});
			setScannedBarcode(null);
			toast.success(`${productName} added to cart`);
			options?.onVariantSelect?.(variant, productName);
		},
		[addItem, options],
	);

	const handleScanComplete = useCallback((code: string) => {
		setScannedBarcode(code);
		setIsSearching(true);
		setIsScanning(false);
	}, []);

	return {
		isScanning,
		setIsScanning,
		isSearching,
		setIsSearching,
		scannedBarcode,
		setScannedBarcode,
		selectedProduct,
		setSelectedProduct,
		isVariantModalOpen,
		setIsVariantModalOpen,
		isCreditModalOpen,
		setIsCreditModalOpen,
		handleProductSelect,
		handleVariantSelect,
		handleScanComplete,
	};
};
