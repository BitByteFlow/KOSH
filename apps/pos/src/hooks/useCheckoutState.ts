import { useState, useCallback, useEffect } from "react";
import type { Product, ProductVariant } from "../types";
import type { CheckoutState, CheckoutActions } from "../types/checkout";
import { useCart } from "../store/useCart";
import { useVariantByBarcode } from "./useProducts";
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

	// Query product by scanned barcode
	const { data: variantData, isLoading: isVariantLoading, error: variantError } = useVariantByBarcode(
		scannedBarcode,
		!!scannedBarcode,
	);

	// Auto-add to cart when barcode scan returns a product
	useEffect(() => {
		if (!scannedBarcode) return;

		console.log('🔍 Looking up barcode:', scannedBarcode);

		if (isVariantLoading) {
			console.log('⏳ Still loading...');
			return;
		}

		if (variantError) {
			console.error('❌ Product not found:', variantError);
			toast.error(`Product with barcode "${scannedBarcode}" not found`);
			setScannedBarcode(null);
			return;
		}

		if (variantData) {
			console.log('✅ Product found:', variantData);
			const variant = variantData as any;
			const productName = variant.product?.productName || "Product";

			addItem({
				id: variant.id,
				name: productName,
				sku: variant.barcode || variant.sku || "",
				price: variant.sellingPrice,
				variantId: variant.id,
				costPrice: variant.costPrice,
				stock: variant.stock || 0,
			});

			toast.success(`${productName} added to cart`);
			// Clear the barcode and hide search panel since product was added
			setScannedBarcode(null);
			setIsSearching(false);
		} else {
			console.log('⚠️ No variant data returned for:', scannedBarcode);
		}
	}, [scannedBarcode, variantData, isVariantLoading, variantError, addItem]);

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
				stock: variant.stock,
			});
			setScannedBarcode(null);
			toast.success(`${productName} added to cart`);
			options?.onVariantSelect?.(variant, productName);
		},
		[addItem, options],
	);

	const handleScanComplete = useCallback((code: string) => {
		console.log('📱 Scan complete:', code);
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
