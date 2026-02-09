"use client";

import { useEffect, useState, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
	SheetFooter,
} from "@kosh/ui/components/sheet";
import { Button } from "@kosh/ui/components/button";
import { Input } from "@kosh/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@kosh/ui/components/select";
import { Plus, Trash2, Loader2, Search, X, Check, Package, ShoppingCart, User, CreditCard } from "lucide-react";
import { useCreateSale } from "../hooks/useSales";
import { formatCurrency } from "@/lib/utils";
import { productsService, type Product, type ProductVariant } from "@/services/products.service";
import { useSession } from "next-auth/react";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@kosh/ui/lib/utils";

interface SaleFormData {
	paymentType: "CASH" | "ONLINE" | "CREDIT";
	creditId?: string;
	customerName?: string;
	customerEmail?: string;
	customerContact?: string;
	discount: string;
	transactionNote: string;
	items: {
		productId: string;
		productName: string;
		variantId: string;
		quantity: string;
		sellPrice: string;
		costPrice: string;
	}[];
}

interface ProductSearchSelectorProps {
	onSelect: (product: Product) => void;
	disabled?: boolean;
}

function ProductSearchSelector({ onSelect, disabled }: ProductSearchSelectorProps) {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Product[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const { data: session } = useSession();
	const debouncedQuery = useDebounce(query, 300);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (debouncedQuery.length > 1 && session?.user?.token) {
			fetchProducts(debouncedQuery);
		} else {
			setResults([]);
		}
	}, [debouncedQuery, session?.user?.token]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const fetchProducts = async (search: string) => {
		setIsLoading(true);
		try {
			const response = await productsService.getProducts(session?.user?.token, { search, limit: 5 });
			setResults(response.data || []);
			setIsOpen(true);
		} catch (error) {
			console.error("Search failed:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative" ref={containerRef}>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search product..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					disabled={disabled}
					className="pl-9 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-1"
				/>
				{isLoading && (
					<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
				)}
			</div>

			{isOpen && results.length > 0 && (
				<div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
					<div className="max-h-[300px] overflow-y-auto p-1">
						{results.map((p) => (
							<button
								key={p.id}
								type="button"
								className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted text-sm rounded-lg transition-colors text-left group"
								onClick={() => {
									onSelect(p);
									setQuery("");
									setIsOpen(false);
								}}
							>
								<div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
									<Package className="h-5 w-5" />
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium truncate">{p.name}</p>
									<p className="text-xs text-muted-foreground">{p.variants.length} variants available</p>
								</div>
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export function CreateSaleSheet({ children }: { children?: React.ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const [addedProducts, setAddedProducts] = useState<Product[]>([]);
	const { data: session } = useSession();
	const createSale = useCreateSale();

	const {
		register,
		handleSubmit,
		control,
		watch,
		reset,
		setValue,
		formState: { isSubmitting },
	} = useForm<SaleFormData>({
		defaultValues: {
			paymentType: "CASH",
			discount: "0",
			transactionNote: "",
			items: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "items",
	});

	const watchItems = watch("items");
	const watchDiscount = watch("discount");
	const watchPaymentType = watch("paymentType");

	// Calculate totals
	const subtotal = watchItems.reduce((sum, item) => {
		const quantity = parseFloat(item.quantity) || 0;
		const sellPrice = parseFloat(item.sellPrice) || 0;
		return sum + quantity * sellPrice;
	}, 0);

	const discount = parseFloat(watchDiscount) || 0;
	const total = subtotal - discount;

	const profit = watchItems.reduce((sum, item) => {
		const quantity = parseFloat(item.quantity) || 0;
		const sellPrice = parseFloat(item.sellPrice) || 0;
		const costPrice = parseFloat(item.costPrice) || 0;
		return sum + quantity * (sellPrice - costPrice);
	}, 0);

	const onSubmit = async (data: SaleFormData) => {
		try {
			await createSale.mutateAsync({
				paymentType: data.paymentType,
				creditId: data.creditId,
				discount: parseFloat(data.discount),
				transactionNote: data.transactionNote,
				customerName: data.customerName,
				customerEmail: data.customerEmail,
				customerContact: data.customerContact,
				items: data.items.map((item) => ({
					variantId: item.variantId,
					quantity: parseInt(item.quantity),
					sellPrice: parseFloat(item.sellPrice),
					costPrice: parseFloat(item.costPrice),
				})),
			});

			setIsOpen(false);
			reset();
		} catch (error) {
			console.error("Failed to create sale:", error);
		}
	};

	const addItem = (product: Product) => {
		const defaultVariant = product.variants[0];
		if (!defaultVariant) return;

		// Persist product info so variants remain accessible
		setAddedProducts(prev => {
			if (prev.find(p => p.id === product.id)) return prev;
			return [...prev, product];
		});

		append({
			productId: product.id,
			productName: product.name,
			variantId: defaultVariant.id,
			quantity: "1",
			sellPrice: defaultVariant.sellPrice.toString(),
			costPrice: defaultVariant.costPrice.toString(),
		});
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				{children || (
					<Button className="flex items-center gap-2 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
						<Plus className="h-4 w-4" />
						New Sale
					</Button>
				)}
			</SheetTrigger>
			<SheetContent className="sm:max-w-[700px] overflow-hidden flex flex-col p-0 border-l-0">
				<div className="bg-primary/5 p-6 border-b">
					<SheetHeader>
						<SheetTitle className="text-2xl font-bold flex items-center gap-2">
							<ShoppingCart className="h-6 w-6 text-primary" />
							Create Sale
						</SheetTitle>
						<SheetDescription className="text-base">
							Add items to generate a new invoice and update your records.
						</SheetDescription>
					</SheetHeader>
				</div>

				<div className="flex-1 overflow-y-auto p-6 space-y-8">
					{/* Product Search */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
								<Package className="h-4 w-4" />
								Add Products
							</h3>
						</div>
						<ProductSearchSelector onSelect={addItem} disabled={isSubmitting} />
					</div>

					{/* Sale Items List */}
					<div className="space-y-4">
						{fields.length === 0 ? (
							<div className="h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/5">
								<Package className="h-8 w-8 opacity-20" />
								<p className="text-sm">Search and select products to see them here</p>
							</div>
						) : (
							<div className="space-y-3">
								{fields.map((field, index) => {
									const item = watchItems[index];
									if (!item) return null;

									return (
										<div
											key={field.id}
											className="group p-4 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
										>
											<div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
											<div className="flex flex-col md:flex-row md:items-center gap-4">
												<div className="flex-1 space-y-1">
													<p className="font-bold text-lg">{item.productName}</p>
													<div className="flex items-center gap-2">
														<Controller
															name={`items.${index}.variantId`}
															control={control}
															render={({ field }) => {
																const product = addedProducts.find(p => p.id === item.productId);
																const variants = product?.variants || [];

																return (
																	<Select
																		value={field.value}
																		onValueChange={(val) => {
																			const variant = variants.find(v => v.id === val);
																			if (variant) {
																				setValue(`items.${index}.variantId`, val);
																				setValue(`items.${index}.sellPrice`, variant.sellPrice.toString());
																				setValue(`items.${index}.costPrice`, variant.costPrice.toString());
																			}
																		}}
																	>
																		<SelectTrigger className="h-7 w-auto py-0 px-2 text-[10px] font-bold bg-primary/10 border-none text-primary rounded-full hover:bg-primary/20 transition-colors">
																			<SelectValue placeholder="Select variant" />
																		</SelectTrigger>
																		<SelectContent>
																			{variants.map(v => (
																				<SelectItem key={v.id} value={v.id} className="text-xs">
																					{v.sku} ({v.stock} in stock)
																				</SelectItem>
																			))}
																		</SelectContent>
																	</Select>
																);
															}}
														/>
													</div>
												</div>

												<div className="flex items-center gap-4">
													<div className="w-24">
														<label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Qty</label>
														<Input
															type="number"
															{...register(`items.${index}.quantity`)}
															className="h-10 text-center font-semibold bg-muted/30 border-none px-2"
														/>
													</div>
													<div className="w-32">
														<label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Price</label>
														<div className="relative">
															<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">Rs</span>
															<Input
																type="number"
																{...register(`items.${index}.sellPrice`)}
																className="h-10 pl-8 font-semibold bg-primary/5 border-none"
															/>
														</div>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="icon"
														className="mt-5 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"
														onClick={() => remove(index)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Payment & Settings */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
						<div className="space-y-6">
							<div className="space-y-2">
								<label className="text-sm font-semibold flex items-center gap-2">
									<CreditCard className="h-4 w-4 text-primary" />
									Payment Method
								</label>
								<Controller
									name="paymentType"
									control={control}
									render={({ field }) => (
										<div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
											{["CASH", "ONLINE", "CREDIT"].map((type) => (
												<button
													key={type}
													type="button"
													onClick={() => setValue("paymentType", type as any)}
													className={cn(
														"flex-1 py-2 text-xs font-bold rounded-lg transition-all",
														field.value === type
															? "bg-white shadow-sm text-primary"
															: "text-muted-foreground hover:bg-white/50"
													)}
												>
													{type}
												</button>
											))}
										</div>
									)}
								/>
							</div>

							{watchPaymentType === "CREDIT" && (
								<div className="space-y-4 col-span-full animate-in slide-in-from-top duration-300">
									<div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
										<p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
											<User className="h-4 w-4" />
											Customer Details
										</p>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<label className="text-[11px] font-bold uppercase text-muted-foreground">Customer Name *</label>
												<Input
													{...register("customerName", { required: watchPaymentType === "CREDIT" })}
													placeholder="Customer"
													className="rounded-xl bg-white border-none shadow-sm"
												/>
											</div>
											<div className="space-y-2">
												<label className="text-[11px] font-bold uppercase text-muted-foreground">Contact Number</label>
												<Input
													{...register("customerContact")}
													placeholder="+977-9800000000"
													className="rounded-xl bg-white border-none shadow-sm"
												/>
											</div>
											<div className="space-y-2 col-span-full">
												<label className="text-[11px] font-bold uppercase text-muted-foreground">Email Address</label>
												<Input
													{...register("customerEmail")}
													type="email"
													placeholder="customer@example.com"
													className="rounded-xl bg-white border-none shadow-sm"
												/>
											</div>
										</div>

										<div className="flex items-center gap-2 pt-2 border-t border-primary/10">
											<div className="w-full">
												<label className="text-[10px] font-bold uppercase text-muted-foreground mb-1 block">Account Search (Optional)</label>
												<Input
													{...register("creditId")}
													placeholder="Enter Account ID if exists"
													className="h-8 text-[10px] rounded-lg border-dashed"
												/>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>

						<div className="space-y-6">
							<div className="space-y-2">
								<label className="text-sm font-semibold">Discount Amount</label>
								<div className="relative">
									<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">Rs</span>
									<Input
										type="number"
										{...register("discount")}
										className="pl-8 h-10 font-bold bg-muted/30 border-none rounded-xl"
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<label className="text-sm font-semibold">Note / Remarks</label>
						<textarea
							{...register("transactionNote")}
							className="w-full min-h-[80px] p-4 bg-muted/30 rounded-2xl border-none focus:ring-1 ring-primary transition-all text-sm outline-none"
							placeholder="Write a brief note for this sale..."
						/>
					</div>
				</div>

				{/* Summary Footer */}
				<div className="p-6 bg-card border-t shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
					<div className="grid grid-cols-2 gap-4 mb-6">
						<div className="space-y-1">
							<p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Subtotal</p>
							<p className="text-lg font-semibold">{formatCurrency(subtotal)}</p>
						</div>
						<div className="space-y-1 text-right">
							<p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Est. Profit</p>
							<p className="text-lg font-semibold text-green-600">+{formatCurrency(profit)}</p>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 bg-primary p-4 rounded-2xl text-primary-foreground flex flex-col justify-center">
							<p className="text-[10px] font-bold uppercase tracking-tight opacity-70">Total Payable</p>
							<p className="text-2xl font-black">{formatCurrency(total)}</p>
						</div>
						<div className="flex sm:flex-col gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsOpen(false)}
								className="flex-1 sm:h-auto rounded-xl border-none bg-muted/50 hover:bg-muted"
							>
								Cancel
							</Button>
							<Button
								onClick={handleSubmit(onSubmit)}
								disabled={isSubmitting || total < 0 || watchItems.length === 0}
								className="flex-[2] sm:h-auto rounded-xl shadow-xl shadow-primary/20"
							>
								{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Sale"}
							</Button>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
