import React from "react";
import { useCart } from "../store/useCart";
import { ShoppingBag, Plus, Minus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@kosh/ui/components/button";
import { Badge } from "@kosh/ui/components/badge";

const Cart: React.FC = () => {
	const { items, updateQuantity, removeItem, clearCart, getTotal } = useCart();
	const total = getTotal();

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
		<div className="flex flex-col h-full bg-white border-l border-slate-200">
			<div className="p-5 border-b border-slate-100 flex items-center justify-between">
				<h3 className="font-bold text-slate-800 flex items-center gap-2">
					Current Sale
					<Badge
						variant="default"
						className="rounded-full h-5 px-1.5 min-w-5 justify-center text-[10px]"
					>
						{items.length}
					</Badge>
				</h3>
				<Button
					variant="ghost"
					onClick={clearCart}
					className="text-red-500 hover:text-red-600 hover:bg-red-50 text-xs font-bold h-7 uppercase tracking-wider"
				>
					Clear
				</Button>
			</div>

			<div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 custom-scrollbar">
				<AnimatePresence mode="popLayout">
					{items.map((item) => (
						<motion.div
							key={item.variantId}
							layout
							initial={{ x: 10, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							exit={{ x: -10, opacity: 0 }}
						>
							<div className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-all bg-slate-50/50">
								<div className="flex items-center gap-3">
									<div className="flex-1">
										<h4 className="font-bold text-normal text-slate-900 leading-tight">
											{item.name}
										</h4>
										<p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
											{item.sku}
										</p>
									</div>

									<Button
										size="icon"
										variant="ghost"
										onClick={() => removeItem(item.variantId)}
										className="h-8 w-8 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500"
									>
										<Trash2 size={14} />
									</Button>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-0.5">
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												updateQuantity(item.variantId, item.quantity - 1)
											}
											className="h-7 w-7 rounded-md hover:bg-slate-50"
										>
											<Minus size={14} />
										</Button>
										<span className="w-8 text-center font-bold text-sm text-slate-800">
											{item.quantity}
										</span>
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												updateQuantity(item.variantId, item.quantity + 1)
											}
											className="h-7 w-7 rounded-md hover:bg-slate-50 text-primary"
										>
											<Plus size={14} />
										</Button>
									</div>

									<div className="text-right">
										<p className="font-semibold text-slate-500 text-sm">
											Rs. {item.price.toFixed(2)} each
										</p>
										<p className="font-black text-slate-900 mt-1">
											Rs. {(item.price * item.quantity).toFixed(2)}
										</p>
									</div>
								</div>
							</div>
						</motion.div>
					))}
				</AnimatePresence>
			</div>

			<div className="p-5 border-t border-slate-100 bg-slate-50/50">
				<div className="flex justify-between items-end">
					<div>
						<p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
							Total
						</p>
						<p className="text-2xl font-black text-slate-900 drop-shadow-sm">
							Rs. {total.toFixed(2)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Cart;
