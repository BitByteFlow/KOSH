import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Package, TrendingUp, Circle } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { Badge } from "@kosh/ui/components/badge";
import type { Product, ProductVariant } from "../types";
import { Card } from "@kosh/ui/components/card";

interface VariantSelectionModalProps {
	product: Product | null;
	isOpen: boolean;
	onClose: () => void;
	onSelectVariant: (variant: ProductVariant, productName: string) => void;
}

const VariantSelectionModal: React.FC<VariantSelectionModalProps> = ({
	product,
	isOpen,
	onClose,
	onSelectVariant,
}) => {
	const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
		null,
	);

	useEffect(() => {
		if (product?.variants?.length === 1) {
			setSelectedVariant(product.variants[0]);
		} else {
			setSelectedVariant(null);
		}
	}, [product]);

	if (!product) return null;

	const handleAddToCart = () => {
		if (selectedVariant) {
			onSelectVariant(selectedVariant, product.productName);
			onClose();
		}
	};

	const lowStockThreshold = 10;

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
					/>

					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{ type: "spring", duration: 0.1, damping: 25 }}
						className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4"
					>
						<Card
							className="bg-white p-0 rounded-3xl shadow-2xl w-full max-w-lg mx-auto overflow-hidden pointer-events-auto border-0"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="bg-linear-to-r from-primary via-primary/90 to-primary/80 p-6 relative overflow-hidden">
								<div className="absolute inset-0 opacity-10">
									<div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white blur-2xl" />
									<div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white blur-2xl" />
								</div>

								<div className="relative z-10">
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
													<Package
														size={16}
														className="text-white"
													/>
												</div>
												<span className="text-xs font-bold text-white/80 uppercase tracking-widest">
													{product.category?.name || "Product"}
												</span>
											</div>
											<h2 className="text-xl font-black text-white tracking-tight leading-tight">
												{product.productName}
											</h2>
											<p className="text-white/70 text-sm font-medium mt-1 flex items-center gap-2">
												<TrendingUp size={14} />
												{product.variants.length} variant
												{product.variants.length > 1 ? "s" : ""} available
											</p>
										</div>
										<Button
											onClick={onClose}
											variant="ghost"
											size="icon"
											className="text-white hover:bg-white/20 rounded-full h-10 w-10 shrink-0 transition-colors"
										>
											<X size={20} />
										</Button>
									</div>
								</div>
							</div>

							<div className="p-5 max-h-[55vh] overflow-y-auto custom-scrollbar">
								<div className="space-y-2">
									{product.variants.map((variant, index) => {
										const isSelected = selectedVariant?.id === variant.id;
										const isLowStock =
											variant.stock > 0 && variant.stock <= lowStockThreshold;
										const isOutOfStock = variant.stock === 0;

										return (
											<motion.div
												key={variant.id}
												initial={{ opacity: 0, x: -10 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.04 }}
											>
												<Button
													onClick={() =>
														!isOutOfStock && setSelectedVariant(variant)
													}
													disabled={isOutOfStock}
													className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 group ${
														isSelected
															? "p-10 border-primary bg-primary/5 shadow-md shadow-primary/10"
															: isOutOfStock
																? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
																: "border-slate-200 hover:border-primary hover:bg-slate-50"
													}`}
												>
													<div className="w-full flex gap-4">
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 mb-1.5 flex-wrap">
																{variant.attributes?.map((attr: any) => (
																	<Badge
																		key={attr.id}
																		className={`text-[11px] h-6 px-2.5 font-bold border-0 ${
																			isSelected
																				? "bg-primary text-white"
																				: "bg-slate-100 text-slate-700"
																		}`}
																	>
																		{attr.value}
																	</Badge>
																))}
															</div>

															<div className="flex items-center gap-3 flex-wrap">
																<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
																	{variant.sku}
																</span>

																<div
																	className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
																		isOutOfStock
																			? "bg-red-100 text-red-700"
																			: isLowStock
																				? "bg-amber-100 text-amber-700"
																				: "bg-green-100 text-green-700"
																	}`}
																>
																	<div
																		className={`w-1.5 h-1.5 rounded-full ${
																			isOutOfStock
																				? "bg-red-500"
																				: isLowStock
																					? "bg-amber-500"
																					: "bg-green-500 animate-pulse"
																		}`}
																	/>
																	{isOutOfStock
																		? "Out of Stock"
																		: isLowStock
																			? `Only ${variant.stock} left`
																			: `In Stock (${variant.stock})`}
																</div>
															</div>
														</div>

														<div className="text-right shrink-0">
															<p
																className={`text-xl font-black ${
																	isOutOfStock
																		? "text-slate-300"
																		: isSelected
																			? "text-primary"
																			: "text-slate-900"
																}`}
															>
																${variant.sellingPrice.toFixed(2)}
															</p>
															{isLowStock && !isOutOfStock && (
																<p className="text-[9px] text-amber-600 font-bold mt-0.5">
																	Low stock
																</p>
															)}
														</div>
													</div>
												</Button>
											</motion.div>
										);
									})}
								</div>
							</div>

							<div className="p-5 bg-linear-to-r from-slate-50 to-white border-t border-slate-100">
								{selectedVariant && (
									<motion.div
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mb-4 p-3.5 bg-linear-to-r from-primary/10 to-primary/5 rounded-2xl border border-primary/20"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
													<Check
														size={20}
														strokeWidth={2.5}
													/>
												</div>
												<div>
													<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
														Selected
													</p>
													<p className="text-sm font-bold text-slate-800">
														{selectedVariant.sku} • {selectedVariant.stock}{" "}
														available
													</p>
												</div>
											</div>
											<div className="text-right">
												<p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
													Total
												</p>
												<p className="text-2xl font-black text-primary">
													${selectedVariant.sellingPrice.toFixed(2)}
												</p>
											</div>
										</div>
									</motion.div>
								)}

								<Button
									onClick={handleAddToCart}
									disabled={!selectedVariant}
									className="w-full h-14 rounded-2xl font-bold text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 bg-gradient-to-r from-primary to-primary/90"
									size="lg"
								>
									{selectedVariant ? (
										<span className="flex items-center gap-2">
											<Check
												size={18}
												strokeWidth={2.5}
											/>
											Add to Cart
											<span className="ml-2 px-2 py-0.5 bg-white/20 rounded-lg text-sm">
												${selectedVariant.sellingPrice.toFixed(2)}
											</span>
										</span>
									) : (
										<span className="flex items-center gap-2 text-white/70">
											<Circle size={18} />
											Select a variant above
										</span>
									)}
								</Button>
							</div>
						</Card>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

export default VariantSelectionModal;
