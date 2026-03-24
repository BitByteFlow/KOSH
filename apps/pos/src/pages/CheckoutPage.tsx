import React, { useState } from "react";
import { useCreateSale } from "../hooks/useSales";
import type { Product, ProductVariant } from "../types";
import { Scan, Search, CreditCard, Banknote, History } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import Scanner from "../components/Scanner";
import ProductSearch from "../components/ProductSearch";
import Cart from "../components/Cart";
import VariantSelectionModal from "../components/VariantSelectionModal";
import { useCart } from "../store/useCart";
import { Button } from "@kosh/ui/components/button";
import { Card } from "@kosh/ui/components/card";
import { Badge } from "@kosh/ui/components/badge";

const CheckoutPage: React.FC = () => {
	const [isScanning, setIsScanning] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);

	const { items, addItem, clearCart, getTotal } = useCart();
	const total = getTotal();
	const createSale = useCreateSale();

	const handleProductSelect = (product: Product) => {
		setSelectedProduct(product);
		setIsVariantModalOpen(true);
	};

	const handleVariantSelect = (
		variant: ProductVariant,
		productName: string,
	) => {
		addItem({
			id: variant.id,
			name: productName,
			sku: variant.sku,
			price: variant.sellingPrice,
			variantId: variant.id,
		});
		setScannedBarcode(null);
		toast.success(`${productName} added to cart`);
	};

	const handleCheckout = async (paymentType: "CASH" | "ONLINE" | "CREDIT") => {
		if (items.length === 0) {
			toast.error("Cart is empty");
			return;
		}

		try {
			const saleInput = {
				total,
				discount: 0,
				profit: 0,
				paymentType,
				items: items.map((item) => ({
					variantId: item.variantId,
					quantity: item.quantity,
					sellPrice: item.price,
					costPrice: 0,
				})),
			};

			const result = await createSale.mutateAsync(saleInput);

			if (result) {
				clearCart();
				toast.success(`Sale completed successfully!`);
			}
		} catch (err) {
			console.error(err);
			// Error is already handled by the hook's onError
		}
	};

	return (
		<div className="h-full flex flex-col md:flex-row bg-slate-50">
			<div className="flex-1 p-6 flex flex-col min-h-0">
				<div className="flex flex-col sm:flex-row gap-4 mb-8">
					<Button
						onClick={() => setIsScanning(true)}
						size="lg"
						className="flex-1 h-20 rounded-2xl flex items-center justify-center gap-4 text-white text-lg font-bold shadow-lg shadow-primary/20"
					>
						<Scan size={32} />
						<div className="text-left leading-tight">
							<p>Barcode Scanner</p>
							<p className="text-[10px] font-medium opacity-80 uppercase tracking-widest">
								Front or Rear Camera
							</p>
						</div>
					</Button>

					<Button
						onClick={() => setIsSearching(!isSearching)}
						variant={isSearching ? "secondary" : "outline"}
						size="lg"
						className={`flex-1 h-20 rounded-2xl flex items-center justify-center gap-4 text-lg font-bold border-2 ${
							isSearching
								? "border-primary"
								: "bg-white border-slate-200 shadow-sm"
						}`}
					>
						<Search
							size={32}
							className={isSearching ? "text-primary" : "text-slate-400"}
						/>
						<div className="text-left leading-tight">
							<p>Manual Search</p>
							<p className="text-[10px] font-medium opacity-60 uppercase tracking-widest">
								Search Inventory
							</p>
						</div>
					</Button>
				</div>

				<div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
					<AnimatePresence mode="wait">
						{isSearching ? (
							<motion.div
								key="search"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: 10 }}
								transition={{ duration: 0.2 }}
							>
								<div className="flex items-center justify-between mb-4 px-1">
									<h2 className="font-bold text-slate-800 uppercase tracking-tighter text-lg">
										Product Catalog
									</h2>
									<div className="h-px flex-1 mx-4 bg-slate-200" />
									<Badge
										variant="outline"
										className="border-slate-200 text-slate-400 font-bold uppercase text-[9px]"
									>
										Select to Configure
									</Badge>
								</div>
								<ProductSearch
									onProductSelect={handleProductSelect}
									externalSearch={scannedBarcode || undefined}
								/>
							</motion.div>
						) : (
							<motion.div
								key="empty"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className="h-full"
							>
								<Card className="h-full flex flex-col items-center justify-center text-center py-20 bg-white/40 border-2 border-dashed border-slate-200 rounded-3xl shadow-none">
									<Button
										className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-100 mb-6 group hover:scale-110 transition-transform cursor-pointer"
										onClick={() => setIsScanning(true)}
									>
										<Scan
											size={40}
											className="text-slate-200 group-hover:text-primary transition-colors"
										/>
									</Button>
									<h3 className="text-xl font-bold text-slate-800 tracking-tight">
										Ready for Transaction
									</h3>
									<p className="text-sm text-slate-500 mt-2 max-w-70 leading-relaxed">
										Scan a barcode or search for products to begin a new sale
										session.
									</p>
								</Card>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>

			<div className="w-full md:w-105 lg:w-120 flex flex-col shadow-2xl relative z-10">
				<div className="flex-1 overflow-hidden">
					<Cart />
				</div>

				<div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
					<div className="grid grid-cols-2 gap-3">
						<Button
							variant="outline"
							size="lg"
							disabled={createSale.isPending || items.length === 0}
							onClick={() => handleCheckout("CASH")}
							className="h-28 rounded-2xl flex flex-col gap-3 bg-white hover:bg-green-50 hover:border-green-200 transition-all font-bold shadow-sm group border-slate-200"
						>
							<div className="p-3 bg-green-100/50 rounded-xl text-green-600 group-hover:scale-110 transition-transform">
								<Banknote size={24} />
							</div>
							<span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-green-700">
								Cash Payment
							</span>
						</Button>

						<Button
							variant="outline"
							size="lg"
							disabled={createSale.isPending || items.length === 0}
							onClick={() => handleCheckout("ONLINE")}
							className="h-28 rounded-2xl flex flex-col gap-3 bg-white hover:bg-blue-50 hover:border-blue-200 transition-all font-bold shadow-sm group border-slate-200"
						>
							<div className="p-3 bg-blue-100/50 rounded-xl text-blue-600 group-hover:scale-110 transition-transform">
								<CreditCard size={24} />
							</div>
							<span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-700">
								Online/Card
							</span>
						</Button>
					</div>

					<Button
						variant="ghost"
						size="lg"
						disabled={createSale.isPending || items.length === 0}
						onClick={() => handleCheckout("CREDIT")}
						className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[11px] text-slate-500 hover:text-orange-600 hover:bg-orange-50 border border-transparent hover:border-orange-100 flex items-center justify-center gap-3"
					>
						<History
							size={18}
							className="text-orange-400"
						/>
						Pay on Credit
					</Button>
				</div>
			</div>

			<AnimatePresence>
				{isScanning && (
					<Scanner
						onScan={(code) => {
							setScannedBarcode(code);
							setIsSearching(true);
						}}
						onClose={() => setIsScanning(false)}
					/>
				)}
			</AnimatePresence>

			<VariantSelectionModal
				product={selectedProduct}
				isOpen={isVariantModalOpen}
				onClose={() => {
					setIsVariantModalOpen(false);
					setSelectedProduct(null);
				}}
				onSelectVariant={handleVariantSelect}
			/>
		</div>
	);
};

export default CheckoutPage;
