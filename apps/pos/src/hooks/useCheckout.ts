import { useCallback, useMemo } from "react";
import { useCreateSale } from "./useSales";
import { useCart } from "../store/useCart";
import { useAuth } from "../context/AuthContext";
import type { CustomerFormData } from "../types/checkout";
import type { CreateSaleRequest } from "../types/api";
import { toast } from "sonner";

interface UseCheckoutOptions {
	onSuccess?: () => void;
	onError?: (error: Error) => void;
}

interface CheckoutResult {
	success: boolean;
	saleId?: string;
}

export const useCheckout = (options?: UseCheckoutOptions) => {
	const { store } = useAuth();
	const createSale = useCreateSale();
	const { items, clearCart, getTotal, getDiscountAmount } = useCart();

	const cartItems = useMemo(() => items, [items]);
	const total = useMemo(() => getTotal(), [getTotal]);
	const discountAmount = useMemo(
		() => getDiscountAmount(),
		[getDiscountAmount],
	);

	const buildSaleInput = useCallback(
		(
			paymentType: "CASH" | "ONLINE" | "CREDIT",
			customerData?: CustomerFormData,
		): CreateSaleRequest | null => {
			if (cartItems.length === 0) {
				toast.error("Cart is empty");
				return null;
			}

			if (!store?.storeId) {
				toast.error("Store information not available");
				return null;
			}

			if (paymentType === "CREDIT" && !customerData) {
				toast.error("Customer information required for credit sales");
				return null;
			}

			return {
				storeId: store.storeId,
				total,
				discount: discountAmount,
				profit: 0,
				paymentType,
				customerName: customerData?.name,
				customerEmail: customerData?.email || undefined,
				customerContact: customerData?.contact,
				items: cartItems.map((item) => ({
					variantId: item.variantId,
					quantity: item.quantity,
					sellPrice: item.price,
					costPrice: item.costPrice,
				})),
			};
		},
		[cartItems, total, discountAmount, store?.storeId],
	);

	const processCheckout = useCallback(
		async (
			paymentType: "CASH" | "ONLINE" | "CREDIT",
			customerData?: CustomerFormData,
		): Promise<CheckoutResult> => {
			const saleInput = buildSaleInput(paymentType, customerData);

			if (!saleInput) {
				return { success: false };
			}

			try {
				const result = await createSale.mutateAsync(saleInput);

				if (result) {
					clearCart();
					toast.success(
						`${paymentType.charAt(0) + paymentType.slice(1).toLowerCase()} sale completed successfully!`,
					);
					options?.onSuccess?.();
					return { success: true, saleId: result.id };
				}

				return { success: false };
			} catch (error) {
				const err =
					error instanceof Error ? error : new Error("Checkout failed");
				options?.onError?.(err);
				return { success: false };
			}
		},
		[buildSaleInput, createSale, clearCart, options],
	);

	const processCreditCheckout = useCallback(
		async (customerData: CustomerFormData): Promise<CheckoutResult> => {
			return processCheckout("CREDIT", customerData);
		},
		[processCheckout],
	);

	const processInstantCheckout = useCallback(
		async (paymentType: "CASH" | "ONLINE"): Promise<CheckoutResult> => {
			return processCheckout(paymentType);
		},
		[processCheckout],
	);

	return {
		isProcessing: createSale.isPending,
		isSuccess: createSale.isSuccess,
		isError: createSale.isError,
		error: createSale.error,
		processCheckout,
		processCreditCheckout,
		processInstantCheckout,
		canCheckout: cartItems.length > 0 && !!store?.storeId,
		cartItemCount: cartItems.length,
	};
};
