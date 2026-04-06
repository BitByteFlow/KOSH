import { create } from "zustand";
import { toast } from "sonner";

export interface CartItem {
	id: string;
	name: string;
	sku: string;
	price: number;
	quantity: number;
	variantId: string;
	costPrice: number;
	stock: number;
}

interface CartStore {
	items: CartItem[];
	discount: number;
	addItem: (product: Omit<CartItem, "quantity">) => void;
	removeItem: (variantId: string) => void;
	updateQuantity: (variantId: string, quantity: number) => void;
	clearCart: () => void;
	getTotal: () => number;
	getSubtotal: () => number;
	setDiscount: (discount: number) => void;
	getDiscountAmount: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
	items: [],
	discount: 0,
	addItem: (product) => {
		const items = get().items;
		const existingItem = items.find(
			(item) => item.variantId === product.variantId,
		);

		if (existingItem) {
			// Check if adding one more would exceed stock
			if (existingItem.quantity + 1 > product.stock) {
				toast.error(`Only ${product.stock} item(s) available in stock`);
				return;
			}

			set({
				items: items.map((item) =>
					item.variantId === product.variantId
						? { ...item, quantity: item.quantity + 1 }
						: item,
				),
			});
		} else {
			set({ items: [...items, { ...product, quantity: 1 }] });
		}
	},
	removeItem: (variantId) => {
		set({ items: get().items.filter((item) => item.variantId !== variantId) });
	},
	updateQuantity: (variantId, quantity) => {
		if (quantity <= 0) {
			get().removeItem(variantId);
			return;
		}

		const items = get().items;
		const item = items.find((i) => i.variantId === variantId);
		
		if (!item) return;

		// Check if requested quantity exceeds stock
		if (quantity > item.stock) {
			toast.error(`Only ${item.stock} item(s) available in stock`);
			return;
		}

		set({
			items: items.map((i) =>
				i.variantId === variantId ? { ...i, quantity } : i,
			),
		});
	},
	clearCart: () => set({ items: [], discount: 0 }),
	getSubtotal: () => {
		return get().items.reduce(
			(acc, item) => acc + item.price * item.quantity,
			0,
		);
	},
	getTotal: () => {
		const subtotal = get().getSubtotal();
		const discountAmount = get().getDiscountAmount();
		return Math.max(0, subtotal - discountAmount);
	},
	setDiscount: (discount) => {
		if (discount < 0 || discount > 100) {
			return;
		}
		set({ discount });
	},
	getDiscountAmount: () => {
		const subtotal = get().getSubtotal();
		const discount = get().discount;
		return (subtotal * discount) / 100;
	},
}));
