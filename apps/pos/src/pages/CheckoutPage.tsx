import React, { useState } from "react";
import { useCreateSale } from "../hooks/useSales";
import type { Product, ProductVariant } from "../types";
import {
	Scan,
	Search,
	CreditCard,
	Banknote,
	History,
	User,
	Mail,
	Phone,
} from "lucide-react";
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
import { useAuth } from "../context/AuthContext";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";

const CheckoutPage: React.FC = () => {
	const { store } = useAuth();
	const [isScanning, setIsScanning] = useState(false);
	const [isSearching, setIsSearching] = useState(false);
	const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
	const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerContact, setCustomerContact] = useState("");

	const { items, addItem, clearCart, getTotal, getDiscountAmount } = useCart();
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
			costPrice: variant.costPrice,
		});
		setScannedBarcode(null);
		toast.success(`${productName} added to cart`);
	};

	const handleCheckout = async (paymentType: "CASH" | "ONLINE" | "CREDIT") => {
		if (items.length === 0) {
			toast.error("Cart is empty");
			return;
		}

		if (paymentType === "CREDIT") {
			setIsCreditModalOpen(true);
			return;
		}

		try {
			const saleInput = {
				storeId: store?.storeId,
				total,
				discount: getDiscountAmount(),
				profit: 0,
				paymentType,
				items: items.map((item) => ({
					variantId: item.variantId,
					quantity: item.quantity,
					sellPrice: item.price,
					costPrice: item.costPrice,
				})),
			};

			const result = await createSale.mutateAsync(saleInput);

			if (result) {
				clearCart();
				toast.success(`Sale completed successfully!`);
			}
		} catch (_) {
			//Already handled in onSuccess of react query
		}
	};

	const handleCreditCheckout = async () => {
		if (!customerName.trim() || !customerContact.trim()) {
			toast.error("Customer name and contact are required for credit sales");
			return;
		}

		try {
			const saleInput = {
				storeId: store?.storeId,
				total,
				discount: getDiscountAmount(),
				profit: 0,
				paymentType: "CREDIT" as const,
				customerName: customerName.trim(),
				customerEmail: customerEmail.trim() || undefined,
				customerContact: customerContact.trim(),
				items: items.map((item) => ({
					variantId: item.variantId,
					quantity: item.quantity,
					sellPrice: item.price,
					costPrice: item.costPrice,
				})),
			};

			const result = await createSale.mutateAsync(saleInput);

			if (result) {
				clearCart();
				setIsCreditModalOpen(false);
				setCustomerName("");
				setCustomerEmail("");
				setCustomerContact("");
				toast.success(`Credit sale completed successfully!`);
			}
		} catch (_) {
			//Already handled in onSuccess of react query
		}
	};

	const closeCreditModal = () => {
		setIsCreditModalOpen(false);
		setCustomerName("");
		setCustomerEmail("");
		setCustomerContact("");
	};

	return (
		<div className="h-full flex flex-col md:flex-row bg-slate-50">
			<div className="flex-1 p-6 flex flex-col min-h-0">
				<div className="grid  grid-cols-2 gap-4 mb-8">
					<Button
						onClick={() => setIsScanning(true)}
						size="lg"
						className="flex-1 h-20 rounded-2xl flex items-center justify-center gap-4 text-white text-lg font-bold shadow-lg shadow-primary/20"
					>
						<Scan size={32} />
						<div className="text-left">
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
						<div className="text-left">
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
							<span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-green-700">
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
							<span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-blue-700">
								Online
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

			<AnimatePresence>
				{isCreditModalOpen && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
						onClick={closeCreditModal}
					>
						<motion.div
							initial={{ scale: 0.95, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.95, opacity: 0, y: 20 }}
							transition={{ type: "spring", duration: 0.3 }}
							className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6">
								<div className="flex items-center gap-3">
									<div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
										<History
											className="text-white"
											size={28}
										/>
									</div>
									<div>
										<h2 className="text-xl font-bold text-white">
											Credit Sale
										</h2>
										<p className="text-sm text-white/80">
											Enter customer details
										</p>
									</div>
								</div>
							</div>

							<div className="p-6 space-y-4">
								<div className="space-y-2">
									<Label
										htmlFor="customerName"
										className="text-sm font-semibold text-slate-700 flex items-center gap-2"
									>
										<User
											size={16}
											className="text-orange-500"
										/>
										Customer Name
										<span className="text-red-500">*</span>
									</Label>
									<Input
										id="customerName"
										placeholder="Enter customer name"
										value={customerName}
										onChange={(e) => setCustomerName(e.target.value)}
										className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="customerEmail"
										className="text-sm font-semibold text-slate-700 flex items-center gap-2"
									>
										<Mail
											size={16}
											className="text-orange-500"
										/>
										Customer Email
									</Label>
									<Input
										id="customerEmail"
										type="email"
										placeholder="Enter email address"
										value={customerEmail}
										onChange={(e) => setCustomerEmail(e.target.value)}
										className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
									/>
								</div>

								<div className="space-y-2">
									<Label
										htmlFor="customerContact"
										className="text-sm font-semibold text-slate-700 flex items-center gap-2"
									>
										<Phone
											size={16}
											className="text-orange-500"
										/>
										Customer Contact
										<span className="text-red-500">*</span>
									</Label>
									<Input
										id="customerContact"
										placeholder="Enter contact number"
										value={customerContact}
										onChange={(e) => setCustomerContact(e.target.value)}
										className="h-12 rounded-xl border-slate-200 focus:border-orange-500 focus:ring-orange-500"
									/>
								</div>

								<div className="pt-4 flex gap-3">
									<Button
										variant="outline"
										onClick={closeCreditModal}
										disabled={createSale.isPending}
										className="flex-1 h-12 rounded-xl font-semibold border-slate-200 hover:bg-slate-50"
									>
										Cancel
									</Button>
									<Button
										onClick={handleCreditCheckout}
										disabled={createSale.isPending}
										className="flex-1 h-12 rounded-xl font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25"
									>
										{createSale.isPending ? "Processing..." : "Complete Sale"}
									</Button>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default CheckoutPage;
