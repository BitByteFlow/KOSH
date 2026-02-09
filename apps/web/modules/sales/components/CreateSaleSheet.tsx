"use client";

import { useEffect, useState } from "react";
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
import { Plus, Trash2, Loader2, Search } from "lucide-react";
import { useCreateSale } from "../hooks/useSales";
import { formatCurrency } from "@/lib/utils";
import { productsService, type Product, type ProductVariant } from "@/services/products.service";
import { useSession } from "next-auth/react";

interface SaleFormData {
	paymentType: "CASH" | "ONLINE" | "CREDIT";
	creditId?: string;
	discount: string;
	transactionNote: string;
	items: {
		productId: string;
		variantId: string;
		quantity: string;
		sellPrice: string;
		costPrice: string;
	}[];
}

interface CreateSaleSheetProps {
	children?: React.ReactNode;
}

export function CreateSaleSheet({ children }: CreateSaleSheetProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { data: session } = useSession();
	const [products, setProducts] = useState<Product[]>([]);
	const [isLoadingProducts, setIsLoadingProducts] = useState(false);
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
			items: [
				{
					productId: "",
					variantId: "",
					quantity: "1",
					sellPrice: "0",
					costPrice: "0",
				},
			],
		},
	});

	const { fields, append, remove } = useFieldArray({
		control,
		name: "items",
	});

	const watchItems = watch("items");
	const watchDiscount = watch("discount");
	const watchPaymentType = watch("paymentType");

	useEffect(() => {
		if (isOpen && session?.user?.token) {
			fetchProducts();
		}
	}, [isOpen, session?.user?.token]);

	const fetchProducts = async () => {
		setIsLoadingProducts(true);
		try {
			const response = await productsService.getProducts(session?.user?.token);
			setProducts(response.data || []);
		} catch (error) {
			console.error("Failed to fetch products:", error);
		} finally {
			setIsLoadingProducts(false);
		}
	};

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

	const handleProductChange = (index: number, productId: string) => {
		const product = products.find((p) => p.id === productId);
		if (product && product.variants && product.variants.length > 0) {
			const defaultVariant = product.variants[0];
			if (defaultVariant) {
				setValue(`items.${index}.productId`, productId);
				setValue(`items.${index}.variantId`, defaultVariant.id);
				setValue(`items.${index}.sellPrice`, (defaultVariant.sellPrice || 0).toString());
				setValue(`items.${index}.costPrice`, (defaultVariant.costPrice || 0).toString());
			}
		}
	};

	const handleVariantChange = (index: number, variantId: string) => {
		const item = watchItems[index];
		if (!item) return;

		const product = products.find((p) => p.id === item.productId);
		const variant = product?.variants?.find((v) => v.id === variantId);
		if (variant) {
			setValue(`items.${index}.variantId`, variantId);
			setValue(`items.${index}.sellPrice`, (variant.sellPrice || 0).toString());
			setValue(`items.${index}.costPrice`, (variant.costPrice || 0).toString());
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				{children || (
					<Button className="flex items-center gap-2">
						<Plus className="h-4 w-4" />
						New Sale
					</Button>
				)}
			</SheetTrigger>
			<SheetContent className="sm:max-w-[700px] overflow-y-auto w-full">
				<SheetHeader>
					<SheetTitle>Create New Sale</SheetTitle>
					<SheetDescription>
						Add products, select payment method, and complete the sale.
					</SheetDescription>
				</SheetHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
					{/* Sale Items */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">Sale Items</h3>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									append({
										productId: "",
										variantId: "",
										quantity: "1",
										sellPrice: "0",
										costPrice: "0",
									})
								}
								disabled={isLoadingProducts}
							>
								<Plus className="h-4 w-4 mr-1" />
								Add Item
							</Button>
						</div>

						{fields.map((field, index) => {
							const selectedProductId = watchItems[index]?.productId;
							const selectedProduct = products.find((p) => p.id === selectedProductId);

							return (
								<div
									key={field.id}
									className="p-4 border rounded-lg space-y-4 relative bg-card"
								>
									{fields.length > 1 && (
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute top-2 right-2 h-8 w-8 p-0"
											onClick={() => remove(index)}
										>
											<Trash2 className="h-4 w-4 text-destructive" />
										</Button>
									)}

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="text-sm font-medium mb-1 block">
												Product
											</label>
											<Controller
												name={`items.${index}.productId`}
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<Select
														value={field.value}
														onValueChange={(val) => handleProductChange(index, val)}
														disabled={isSubmitting || isLoadingProducts}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select product" />
														</SelectTrigger>
														<SelectContent>
															{products.map((p) => (
																<SelectItem key={p.id} value={p.id}>
																	{p.name}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
											/>
										</div>

										<div>
											<label className="text-sm font-medium mb-1 block">
												Variant
											</label>
											<Controller
												name={`items.${index}.variantId`}
												control={control}
												rules={{ required: true }}
												render={({ field }) => (
													<Select
														value={field.value}
														onValueChange={(val) => handleVariantChange(index, val)}
														disabled={isSubmitting || !selectedProduct}
													>
														<SelectTrigger>
															<SelectValue placeholder="Select variant" />
														</SelectTrigger>
														<SelectContent>
															{selectedProduct?.variants.map((v) => (
																<SelectItem key={v.id} value={v.id}>
																	{v.sku} - {formatCurrency(parseFloat(v.sellPrice))} (Stock: {v.stock})
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												)}
											/>
										</div>

										<div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
											<div>
												<label className="text-sm font-medium mb-1 block">Quantity</label>
												<Input
													type="number"
													step="1"
													min="1"
													{...register(`items.${index}.quantity`, {
														required: true,
														min: 1,
													})}
													disabled={isSubmitting}
												/>
											</div>

											<div>
												<label className="text-sm font-medium mb-1 block">Sell Price</label>
												<Input
													type="number"
													step="0.01"
													min="0"
													{...register(`items.${index}.sellPrice`, {
														required: true,
														min: 0,
													})}
													disabled={isSubmitting}
												/>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>

					{/* Payment Information */}
					<div className="space-y-4 pt-4 border-t">
						<h3 className="text-sm font-medium">Payment & Extras</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-medium mb-1 block">Payment Type</label>
								<Controller
									name="paymentType"
									control={control}
									render={({ field }) => (
										<Select
											value={field.value}
											onValueChange={field.onChange}
											disabled={isSubmitting}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="CASH">Cash</SelectItem>
												<SelectItem value="ONLINE">Online</SelectItem>
												<SelectItem value="CREDIT">Credit</SelectItem>
											</SelectContent>
										</Select>
									)}
								/>
							</div>

							<div>
								<label className="text-sm font-medium mb-1 block">Discount</label>
								<Input
									type="number"
									step="0.01"
									min="0"
									{...register("discount", { min: 0 })}
									disabled={isSubmitting}
								/>
							</div>
						</div>

						{watchPaymentType === "CREDIT" && (
							<div>
								<label className="text-sm font-medium mb-1 block">
									Credit Account ID
								</label>
								<Input
									{...register("creditId", { required: true })}
									placeholder="Enter credit account ID"
									disabled={isSubmitting}
								/>
							</div>
						)}

						<div>
							<label className="text-sm font-medium mb-1 block">
								Transaction Note
							</label>
							<textarea
								{...register("transactionNote")}
								className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Add a note for this sale..."
								disabled={isSubmitting}
							/>
						</div>
					</div>

					{/* Summary */}
					<div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Subtotal:</span>
							<span className="font-medium">{formatCurrency(subtotal)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Discount:</span>
							<span className="font-medium text-destructive">
								-{formatCurrency(discount)}
							</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-muted-foreground">Est. Profit:</span>
							<span className="font-medium text-green-600">
								{formatCurrency(profit)}
							</span>
						</div>
						<div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
							<span>Total Amount:</span>
							<span>{formatCurrency(total)}</span>
						</div>
					</div>

					<SheetFooter className="gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={isSubmitting || total < 0 || watchItems.some(i => !i.variantId)}>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								"Complete Sale"
							)}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
