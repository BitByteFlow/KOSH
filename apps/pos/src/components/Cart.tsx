import React, { memo } from "react";
import { useCart } from "../store/useCart";
import { ShoppingBag, Plus, Minus, Trash2, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@kosh/ui/components/button";
import { Badge } from "@kosh/ui/components/badge";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";

interface CartItemComponentProps {
	item: {
		variantId: string;
		name: string;
		sku: string;
		price: number;
		quantity: number;
		stock: number;
	};
	updateQuantity: (variantId: string, quantity: number) => void;
	removeItem: (variantId: string) => void;
}

const CartItemComponent = memo<CartItemComponentProps>(
	({ item, updateQuantity, removeItem }) => {
		const isMaxQuantity = item.quantity >= item.stock;
		const isLowStock = item.stock > 0 && item.stock <= 5;

		return (
			<motion.div
				key={item.variantId}
				layout
				initial={{ x: 10, opacity: 0 }}
				animate={{ x: 0, opacity: 1 }}
				exit={{ x: -10, opacity: 0 }}
				transition={{ duration: 0.15 }}
			>
				<div className="flex flex-col gap-1.5 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/50">
					<div className="flex items-center gap-2">
						<div className="flex-1 min-w-0">
							<h4 className="font-semibold text-sm text-slate-900 leading-tight truncate">
								{item.name}
							</h4>
							<p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mt-0.5">
								{item.sku}
							</p>
						</div>

						<Button
							size="icon"
							variant="ghost"
							onClick={() => removeItem(item.variantId)}
							className="h-6 w-6 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 shrink-0"
						>
							<Trash2 size={12} />
						</Button>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center gap-0.5 bg-white rounded-md border border-slate-200 p-0.5">
							<Button
								size="icon"
								variant="ghost"
								onClick={() =>
									updateQuantity(item.variantId, item.quantity - 1)
								}
								className="h-6 w-6 rounded-sm hover:bg-slate-50"
							>
								<Minus size={12} />
							</Button>
							<div className="w-10 text-center font-bold text-xs text-slate-800 flex flex-col items-center leading-tight">
								<span>{item.quantity}</span>
								<span className="text-[7px] text-slate-400 font-normal leading-none">
									/ {item.stock}
								</span>
							</div>
							<Button
								size="icon"
								variant="ghost"
								disabled={isMaxQuantity}
								onClick={() =>
									updateQuantity(item.variantId, item.quantity + 1)
								}
								className={`h-6 w-6 rounded-sm transition-all ${
									isMaxQuantity
										? "opacity-30 cursor-not-allowed text-slate-300"
										: "hover:bg-slate-50 text-primary"
								}`}
							>
								<Plus size={12} />
							</Button>
						</div>

						<div className="text-right">
							<p className="font-bold text-slate-900 text-sm">
								Rs. {(item.price * item.quantity).toFixed(2)}
							</p>
							{isLowStock && (
								<p className="text-[9px] text-orange-500 font-medium">
									{item.stock} left
								</p>
							)}
						</div>
					</div>
				</div>
			</motion.div>
		);
	},
);

CartItemComponent.displayName = "CartItemComponent";

const Cart: React.FC = () => {
	const {
		items,
		updateQuantity,
		removeItem,
		clearCart,
		getTotal,
		getSubtotal,
		discount,
		setDiscount,
		getDiscountAmount,
	} = useCart();
	const total = getTotal();
	const subtotal = getSubtotal();
	const discountAmount = getDiscountAmount();

	const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value);
		if (!Number.isNaN(value) && value >= 0 && value <= 100) {
			setDiscount(value);
		} else if (e.target.value === "") {
			setDiscount(0);
		}
	};

	if (items.length === 0) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-white/50 border-l border-slate-100">
				<div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
					<ShoppingBag
						size={24}
						className="text-slate-300"
					/>
				</div>
				<h3 className="font-bold text-slate-500 mb-1 leading-tight">
					Your cart is empty
				</h3>
				<p className="text-xs max-w-38">
					Items added from search or scanner will appear here.
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full bg-white border-l border-slate-200 overflow-y-auto">
			<div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
				<h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
					Current Sale
					<Badge
						variant="default"
						className="rounded-full h-4 px-1.5 min-w-4 justify-center text-[9px]"
					>
						{items.length}
					</Badge>
				</h3>
				<Button
					variant="ghost"
					onClick={clearCart}
					className="text-red-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-bold h-6 uppercase tracking-wider"
				>
					Clear
				</Button>
			</div>

			<div className="flex-1 px-3 py-2 space-y-1.5 custom-scrollbar">
				<AnimatePresence mode="popLayout">
					{items.map((item) => (
						<CartItemComponent
							key={item.variantId}
							item={item}
							updateQuantity={updateQuantity}
							removeItem={removeItem}
						/>
					))}
				</AnimatePresence>
			</div>

			<div className="p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
				<div className="space-y-2">
					<div className="flex justify-between items-center">
						<p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
							Subtotal
						</p>
						<p className="font-semibold text-slate-700">
							Rs. {subtotal.toFixed(2)}
						</p>
					</div>

					<div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
						<div className="flex items-center gap-2 flex-1">
							<Percent
								size={16}
								className="text-orange-500"
							/>
							<Label
								htmlFor="discount"
								className="text-sm font-semibold text-slate-700 cursor-pointer"
							>
								Discount
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<Input
								id="discount"
								type="number"
								min="0"
								max="100"
								value={discount}
								onChange={handleDiscountChange}
								className="w-20 h-9 text-right font-bold border-slate-200 focus:border-orange-500 focus:ring-orange-500"
							/>
							<span className="text-sm font-bold text-slate-500">%</span>
						</div>
					</div>

					{discountAmount > 0 && (
						<div className="flex justify-between items-center text-green-600">
							<p className="text-sm font-semibold text-green-600">
								Discount Amount
							</p>
							<p className="font-semibold text-green-600">
								- Rs. {discountAmount.toFixed(2)}
							</p>
						</div>
					)}
				</div>

				<div className="pt-3 border-t border-slate-200">
					<div className="flex justify-between items-end">
						<div>
							<p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
								Total
							</p>
							<p className="text-xl font-bold text-slate-900 drop-shadow-sm">
								Rs. {total.toFixed(2)}
							</p>
						</div>
						{discountAmount > 0 && (
							<Badge
								variant="outline"
								className="bg-green-50 text-green-700 border-green-200 font-bold text-xs"
							>
								Saving Rs. {discountAmount.toFixed(2)}
							</Badge>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Cart;
