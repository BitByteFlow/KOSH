import { create } from "zustand";

export interface CartItem {
	id: string;
	name: string;
	sku: string;
	price: number;
	quantity: number;
	variantId: string;
	costPrice: number;
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
		set({
			items: get().items.map((item) =>
				item.variantId === variantId ? { ...item, quantity } : item,
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
