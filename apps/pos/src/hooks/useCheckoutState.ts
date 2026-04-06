import { useState, useCallback } from "react";
import type { Product, ProductVariant } from "../types";
import type { CheckoutState, CheckoutActions } from "../types/checkout";
import { useCart } from "../store/useCart";
import { productsApi } from "../services/products.api";
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
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
	const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
	const [isBarcodeProcessing, setIsBarcodeProcessing] = useState(false);

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
			toast.success(`${productName} added to cart`);
			options?.onVariantSelect?.(variant, productName);
		},
		[addItem, options],
	);

	const handleScanComplete = useCallback(
		async (barcode: string) => {
			if (isBarcodeProcessing) return;

			console.log("📱 Barcode scanned:", barcode);
			setIsBarcodeProcessing(true);
			setIsScanning(false);

			try {
				const variant = await productsApi.getVariantByBarcode(barcode);

				if (!variant) {
					toast.error(`Product not found for barcode: ${barcode}`);
					return;
				}

				const productName = variant.product?.name || "Product";

				addItem({
					id: variant.id,
					name: productName,
					sku: variant.barcode || variant.sku || "",
					price: variant.sellingPrice,
					variantId: variant.id,
					costPrice: variant.costPrice,
					stock: variant.stock,
				});

				toast.success(`${productName} added to cart`);
			} catch (error) {
				console.error("❌ Barcode lookup failed:", error);
				toast.error("Failed to look up product. Please try again.");
			} finally {
				setIsBarcodeProcessing(false);
			}
		},
		[addItem, isBarcodeProcessing],
	);

	const handleSearchToggle = useCallback(() => {
		setIsSearching((prev) => !prev);
	}, []);

	return {
		isScanning,
		setIsScanning,
		isSearching,
		setIsSearching,
		selectedProduct,
		setSelectedProduct,
		isVariantModalOpen,
		setIsVariantModalOpen,
		isCreditModalOpen,
		setIsCreditModalOpen,
		handleProductSelect,
		handleVariantSelect,
		handleScanComplete,
		handleSearchToggle,
	};
};
