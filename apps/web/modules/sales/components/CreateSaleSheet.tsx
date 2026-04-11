"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
	useForm,
	useFieldArray,
	Controller,
	SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createSaleSchema, CreateSaleInput } from "@kosh/validation";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
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
import {
	Plus,
	Trash2,
	Loader2,
	Search,
	Package,
	ShoppingCart,
	User,
	CreditCard,
	AlertCircle,
	ArrowLeft,
} from "lucide-react";
import { useCreateSale } from "../hooks/useSales";
import { formatCurrency } from "@/lib/utils";
import { LIST_PRODUCTS_WITH_FILTER } from "@/services/products.service";
import { useQuery } from "@apollo/client/react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "sonner";
import { logger } from "@/lib/logger";
import { cn } from "@kosh/ui/lib/utils";
import {
	Product,
	ProductVariant,
	ProductResponse,
	PaymentType,
} from "@/gql/graphql";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";
import { z } from "zod";
import { useCurrentStore } from "@/context/StoreContext";

type SaleFormValues = z.infer<typeof createSaleSchema>;

interface ProductSearchSelectorProps {
	onSelect: (product: Product, variant: ProductVariant) => void;
	disabled?: boolean;
}

function ProductSearchSelector({
	onSelect,
	disabled,
}: ProductSearchSelectorProps) {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const [isFocused, setIsFocused] = useState(false);

	const debouncedQuery = useDebounce(query, 300);
	const containerRef = useRef<HTMLDivElement>(null);

	const { data: rawData, loading: isLoading } = useQuery<{
		listProductsWithFilter: ProductResponse;
	}>(LIST_PRODUCTS_WITH_FILTER, {
		variables: {
			filterInput: {
				search: debouncedQuery,
				limit: 5,
				page: 1,
			},
		},
		skip: debouncedQuery.length <= 1 || !!selectedProduct,
	});

	const results = useMemo(
		() =>
			parseGraphQLListResponse<Product>(rawData?.listProductsWithFilter).data ||
			[],
		[rawData],
	);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
				setSelectedProduct(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleProductClick = (product: Product) => {
		setSelectedProduct(product);
	};

	return (
		<div
			className="relative"
			ref={containerRef}
		>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="Search products by name or SKU..."
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setSelectedProduct(null);
						setIsOpen(true);
					}}
					onFocus={() => {
						setIsOpen(true);
						setIsFocused(true);
					}}
					onBlur={() => setIsFocused(false)}
					disabled={disabled}
					className="pl-9 h-11 bg-muted/30 border-none shadow-none focus-visible:ring-1"
				/>
				{isLoading && (
					<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
				)}
			</div>

			{isOpen && (isFocused || query.length > 0 || selectedProduct) && (
				<div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
					<div className="max-h-87.5 overflow-y-auto p-1">
						{selectedProduct ? (
							<div className="space-y-1">
								<button
									type="button"
									onClick={() => setSelectedProduct(null)}
									className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/5 rounded-lg transition-colors border-b mb-1"
								>
									<ArrowLeft className="h-3 w-3" />
									Back to search results
								</button>
								<div className="px-3 py-2">
									<p className="text-xs font-bold uppercase text-muted-foreground mb-2">
										Select Variant for {selectedProduct.productName}
									</p>
									<div className="grid gap-1">
										{selectedProduct.variants.map((v) => (
											<button
												key={v.id}
												type="button"
												className="flex items-center justify-between w-full p-3 hover:bg-muted text-sm rounded-xl transition-all border border-transparent hover:border-border group text-left"
												onClick={() => {
													onSelect(selectedProduct, v);
													setQuery("");
													setSelectedProduct(null);
													setIsOpen(false);
												}}
											>
												<div className="flex flex-col gap-0.5">
													<div className="flex items-center gap-2">
														<span className="font-bold">{v.sku}</span>
														{v.attributes && v.attributes.length > 0 && (
															<span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
																{v.attributes.map((a) => a.value).join(" / ")}
															</span>
														)}
													</div>
													<p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">
														Stock:{" "}
														<span
															className={cn(
																v.stock <= 0
																	? "text-destructive"
																	: "text-green-600",
															)}
														>
															{v.stock}
														</span>
													</p>
												</div>
												<div className="text-right">
													<p className="font-bold text-primary">
														{formatCurrency(v.price)}
													</p>
													<Plus className="h-4 w-4 ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
												</div>
											</button>
										))}
									</div>
								</div>
							</div>
						) : results.length > 0 ? (
							results.map((p) => (
								<button
									key={p.id}
									type="button"
									className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-muted text-sm rounded-xl transition-colors text-left group"
									onClick={() => handleProductClick(p)}
								>
									<div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
										<Package className="h-5 w-5" />
									</div>
									<div className="flex-1 min-w-0">
										<p className="font-bold truncate text-base">
											{p.productName}
										</p>
										<div className="flex items-center gap-2">
											<span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
												{p.category.name}
											</span>
											<span className="text-[10px] font-bold text-primary">
												{p.variants.length} variant
												{p.variants.length > 1 ? "s" : ""}
											</span>
										</div>
									</div>
								</button>
							))
						) : query.length > 1 && !isLoading ? (
							<div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
								<Search className="h-8 w-8 opacity-20" />
								<p>No products found for "{query}"</p>
							</div>
						) : (
							<div className="p-8 text-center text-xs text-muted-foreground italic">
								Type to search products...
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export function CreateSaleSheet({ children }: { children?: React.ReactNode }) {
	const [isOpen, setIsOpen] = useState(false);
	const { store } = useCurrentStore();
	const [addedProducts, setAddedProducts] = useState<Product[]>([]);
	const [mutate, { loading: isMutating }] = useCreateSale();

	const {
		register,
		handleSubmit,
		control,
		watch,
		reset,
		setValue,
		formState: { isSubmitting, errors },
	} = useForm<SaleFormValues>({
		resolver: zodResolver(createSaleSchema),
		defaultValues: {
			storeId: store?.id,
			paymentType: "CASH",
			discount: 0,
			transactionNote: "",
			items: [],
		},
		mode: "onChange",
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "items",
	});

	const watchItems = watch("items") || [];
	const watchDiscount = watch("discount") || 0;
	const watchPaymentType = watch("paymentType");

	useEffect(() => {
		if (store?.id) {
			setValue("storeId", store.id);
		}
	}, [store?.id, setValue]);

	useEffect(() => {
		if (!isOpen) {
			reset({
				storeId: store?.id as string,
				paymentType: "CASH",
				discount: 0,
				transactionNote: "",
				items: [],
			});
			setAddedProducts([]);
		}
	}, [isOpen, reset, store?.id]);

	const subtotal = watchItems.reduce((sum: number, item: any) => {
		const quantity = item?.quantity || 0;
		const sellPrice = item?.sellPrice || 0;
		return sum + Number(quantity) * Number(sellPrice);
	}, 0);

	const total = subtotal - Number(watchDiscount);

	// const profit = watchItems.reduce((sum: number, item: any) => {
	// 	const quantity = item?.quantity || 0;
	// 	const sellPrice = item?.sellPrice || 0;
	// 	const costPrice = item?.costPrice || 0;
	// 	return sum + Number(quantity) * (Number(sellPrice) - Number(costPrice));
	// }, 0);

	const onSubmit: SubmitHandler<SaleFormValues> = async (data) => {
		try {
			const { data: result } = await mutate({
				variables: {
					input: {
						...data,
						paymentType: data.paymentType as PaymentType,
						discount: Number(data.discount),
						items: data.items.map((item) => ({
							...item,
							quantity: Number(item.quantity),
							sellPrice: Number(item.sellPrice),
							costPrice: Number(item.costPrice),
						})),
					},
				},
			});

			if (result?.createSale?.success) {
				setIsOpen(false);
				reset();
			}
		} catch (error: any) {
			console.error("Failed to create sale:", error);
		}
	};

	const addItem = (product: Product, variant: ProductVariant) => {
		setAddedProducts((prev) => {
			if (prev.find((p) => p.id === product.id)) return prev;
			return [...prev, product];
		});

		append({
			variantId: variant.id,
			quantity: 1,
			sellPrice: Number(variant.price) || 0,
			costPrice: Number(variant.costPrice) || 0,
		});
	};

	return (
		<Sheet
			open={isOpen}
			onOpenChange={setIsOpen}
		>
			<SheetTrigger asChild>
				{children || (
					<Button className="py-6 flex items-center gap-2 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 hover:cursor-pointer">
						<Plus className="h-6 w-6" />
						<span className="text-base font-semibold">New Sale</span>
					</Button>
				)}
			</SheetTrigger>
			<SheetContent className="sm:max-w-187.5 overflow-hidden flex flex-col p-0 border-l-0">
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

				<form
					onSubmit={handleSubmit(onSubmit, (errors) => {
						logger.warn("Form validation errors", "CreateSale", errors);
						toast.error("Please fix the errors in the form before submitting.");
					})}
					className="flex-1 overflow-hidden flex flex-col"
				>
					<div className="flex-1 overflow-y-auto p-6 space-y-8">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
									<Package className="h-4 w-4" />
									Add Products
								</h3>
							</div>
							<ProductSearchSelector
								onSelect={addItem}
								disabled={isSubmitting || isMutating}
							/>
							{errors.items?.message && (
								<p className="text-xs text-destructive flex items-center gap-1">
									<AlertCircle className="h-3 w-3" />
									{errors.items.message}
								</p>
							)}
						</div>

						<div className="space-y-4">
							{fields.length === 0 ? (
								<div className="h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground bg-muted/5">
									<Package className="h-8 w-8 opacity-20" />
									<p className="text-sm">
										Search and select products to see them here
									</p>
								</div>
							) : (
								<div className="space-y-3">
									{fields.map((field, index) => {
										const item = watchItems[index];
										if (!item) return null;

										const product = addedProducts.find((p) =>
											p.variants.some((v) => v.id === item.variantId),
										);
										const currentVariant = product?.variants.find(
											(v) => v.id === item.variantId,
										);

										return (
											<div
												key={field.id}
												className="group p-4 bg-card border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden"
											>
												<div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
												<div className="flex flex-col md:flex-row md:items-center gap-4">
													<div className="flex-1 space-y-1">
														<p className="font-bold text-lg">
															{product?.productName || "Product"}
														</p>
														<div className="flex flex-col gap-1">
															<Controller
																name={`items.${index}.variantId`}
																control={control}
																render={({ field }) => {
																	const variants = product?.variants || [];
																	return (
																		<Select
																			value={field.value}
																			onValueChange={(val) => {
																				const variant = variants.find(
																					(v) => v.id === val,
																				);
																				if (variant) {
																					setValue(
																						`items.${index}.variantId`,
																						val,
																					);
																					setValue(
																						`items.${index}.sellPrice`,
																						Number(variant.price),
																					);
																					setValue(
																						`items.${index}.costPrice`,
																						Number(variant.costPrice),
																					);
																				}
																			}}
																		>
																			<SelectTrigger className="h-7 w-auto py-0 px-2 text-[10px] font-bold bg-primary/10 border-none text-primary rounded-full hover:bg-primary/20 transition-colors">
																				<SelectValue placeholder="Select variant" />
																			</SelectTrigger>
																			<SelectContent>
																				{variants.map((v) => (
																					<SelectItem
																						key={v.id}
																						value={v.id}
																						className="text-xs"
																					>
																						{v.sku} ({v.stock} in stock)
																					</SelectItem>
																				))}
																			</SelectContent>
																		</Select>
																	);
																}}
															/>
															{errors.items?.[index]?.variantId && (
																<p className="text-[10px] text-destructive">
																	{errors.items[index]?.variantId?.message}
																</p>
															)}
														</div>
													</div>

													<div className="flex items-center gap-4">
														<div className="w-24">
															<label
																htmlFor="quantity"
																className="text-sm font-bold uppercase text-muted-foreground mb-1 block"
															>
																Qty
															</label>
															<Input
																type="number"
																id="quantity"
																{...register(`items.${index}.quantity`, {
																	valueAsNumber: true,
																})}
																className={cn(
																	"h-10 text-center font-semibold bg-muted/30 border-none px-2",
																	errors.items?.[index]?.quantity &&
																		"ring-1 ring-destructive",
																)}
															/>
															{errors.items?.[index]?.quantity && (
																<p className="text-[10px] text-destructive mt-1">
																	{errors.items[index]?.quantity?.message}
																</p>
															)}
														</div>
														<div className="w-32">
															<label
																htmlFor="productPrice"
																className="text-sm font-bold uppercase text-muted-foreground mb-1 block"
															>
																Price
															</label>
															<div className="relative">
																<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
																	Rs
																</span>
																<Input
																	type="number"
																	step="0.01"
																	{...register(`items.${index}.sellPrice`, {
																		valueAsNumber: true,
																	})}
																	className={cn(
																		"h-10 pl-8 font-semibold bg-primary/5 border-none",
																		errors.items?.[index]?.sellPrice &&
																			"ring-1 ring-destructive",
																	)}
																/>
															</div>
															{errors.items?.[index]?.sellPrice && (
																<p className="text-[10px] text-destructive mt-1">
																	{errors.items[index]?.sellPrice?.message}
																</p>
															)}
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

						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t">
							<div className="space-y-6">
								<div className="space-y-2">
									<label
										htmlFor="paymentMethod"
										className="text-sm font-semibold flex items-center gap-2"
									>
										<CreditCard className="h-4 w-4 text-primary" />
										Payment Method
									</label>
									<Controller
										name="paymentType"
										control={control}
										render={({ field }) => (
											<div className="flex gap-2 p-1 bg-muted/30 rounded-xl">
												{[
													{ label: "CASH", value: "CASH" },
													{ label: "ONLINE", value: "ONLINE" },
													{ label: "CREDIT", value: "CREDIT" },
												].map((type) => (
													<button
														key={type.value}
														type="button"
														onClick={() => field.onChange(type.value)}
														className={cn(
															"flex-1 py-2 text-xs font-bold rounded-lg transition-all",
															field.value === type.value
																? "bg-white shadow-sm text-primary"
																: "text-muted-foreground hover:bg-white/50",
														)}
													>
														{type.label}
													</button>
												))}
											</div>
										)}
									/>
									{errors.paymentType && (
										<p className="text-xs text-destructive">
											{errors.paymentType.message}
										</p>
									)}
								</div>

								{watchPaymentType === "CREDIT" && (
									<div className="space-y-4 col-span-full animate-in slide-in-from-top duration-300">
										<div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
											<p className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
												<User className="h-4 w-4" />
												Customer Details{" "}
												{watchPaymentType === "CREDIT"
													? "(Required)"
													: "(Optional)"}
											</p>

											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<label
														htmlFor="customerName"
														className="text-sm font-bold uppercase text-muted-foreground"
													>
														Customer Name
													</label>
													<Input
														id="customerName"
														{...register("customerName")}
														required={watchPaymentType === "CREDIT"}
														placeholder="Full Name"
														className={cn(
															"rounded-xl bg-white border-none shadow-sm",
															errors.customerName && "ring-1 ring-destructive",
														)}
													/>
													{errors.customerName && (
														<p className="text-xs text-destructive">
															{errors.customerName.message}
														</p>
													)}
												</div>
												<div className="space-y-2">
													<label
														htmlFor="contactNumber"
														className="text-sm font-bold uppercase text-muted-foreground"
													>
														Contact Number
													</label>
													<Input
														id="contactNumber"
														{...register("customerContact")}
														required={watchPaymentType === "CREDIT"}
														placeholder="+977-98XXXXXXXX"
														className={cn(
															"rounded-xl bg-white border-none shadow-sm",
															errors.customerContact &&
																"ring-1 ring-destructive",
														)}
													/>
													{errors.customerContact && (
														<p className="text-xs text-destructive">
															{errors.customerContact.message}
														</p>
													)}
												</div>
												<div className="space-y-2 col-span-full">
													<label
														htmlFor="emailAddress"
														className="text-sm font-bold uppercase text-muted-foreground"
													>
														Email Address
													</label>
													<Input
														id="emailAddress"
														{...register("customerEmail")}
														required={watchPaymentType === "CREDIT"}
														type="email"
														placeholder="customer@example.com"
														className={cn(
															"rounded-xl bg-white border-none shadow-sm",
															errors.customerEmail && "ring-1 ring-destructive",
														)}
													/>
													{errors.customerEmail && (
														<p className="text-xs text-destructive">
															{errors.customerEmail.message}
														</p>
													)}
												</div>
											</div>
										</div>
									</div>
								)}
							</div>

							<div className="space-y-6">
								<div className="space-y-2">
									<label
										htmlFor="discountAmmount"
										className="text-sm font-semibold"
									>
										Discount Amount
									</label>
									<div className="relative">
										<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
											Rs
										</span>
										<Input
											type="number"
											step="0.01"
											{...register("discount", { valueAsNumber: true })}
											className={cn(
												"pl-8 h-10 font-bold bg-muted/30 border-none rounded-xl",
												errors.discount && "ring-1 ring-destructive",
											)}
										/>
									</div>
									{errors.discount && (
										<p className="text-xs text-destructive">
											{errors.discount.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<label
										htmlFor="remarks"
										className="text-sm font-semibold"
									>
										Note / Remarks
									</label>
									<textarea
										{...register("transactionNote")}
										className="w-full min-h-25 p-4 bg-muted/30 rounded-2xl border-none focus:ring-1 ring-primary transition-all text-sm outline-none resize-none"
										placeholder="Write a brief note for this sale..."
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="p-6 bg-card border-t shadow-[0_-10px_20px_-15px_rgba(0,0,0,0.1)]">
						<div className="grid grid-cols-2 gap-4 mb-6">
							<div className="space-y-1">
								<p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
									Subtotal
								</p>
								<p className="text-lg font-semibold">
									{formatCurrency(subtotal)}
								</p>
							</div>
							{/* <div className="space-y-1 text-right">
								<p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Est. Profit</p>
								<p className="text-lg font-semibold text-green-600">+{formatCurrency(profit)}</p>
							</div> */}
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<div className="flex-1 bg-primary p-4 rounded-2xl text-primary-foreground flex flex-col justify-center">
								<p className="text-[10px] font-bold uppercase tracking-tight opacity-70">
									Total Payable
								</p>
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
									type="submit"
									disabled={
										isSubmitting ||
										isMutating ||
										total < 0 ||
										watchItems.length === 0
									}
									className="flex-2 sm:h-auto rounded-xl shadow-xl shadow-primary/20"
								>
									{isSubmitting || isMutating ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										"Complete Sale"
									)}
								</Button>
							</div>
						</div>
					</div>
				</form>
			</SheetContent>
		</Sheet>
	);
}
