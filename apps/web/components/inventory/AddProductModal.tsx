"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@kosh/ui/components/sheet";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";
import { Checkbox } from "@kosh/ui/components/checkbox";
import { cn } from "@kosh/ui/lib/utils";
import { VariantAttribute, Variant } from "@/types/inventory";


export function AddProductModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [keepPurchaseRecord, setKeepPurchaseRecord] = useState(false);

	const [productData, setProductData] = useState({
		name: "",
		categoryId: "",
		supplierName: "",
	});

	const [variants, setVariants] = useState<Variant[]>([
		{
			id: "1",
			costPrice: "",
			sellingPrice: "",
			stock: "0",
			attributes: [{ name: "", value: "" }],
		},
	]);

	const handleProductChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setProductData((prev) => ({ ...prev, [name]: value }));
	};

	// Variant Actions
	const addVariant = () => {
		setVariants((prev) => [
			...prev,
			{
				id: Math.random().toString(36).substr(2, 9),
				costPrice: "",
				sellingPrice: "",
				stock: "0",
				attributes: [{ name: "", value: "" }],
			},
		]);
	};

	const removeVariant = (id: string) => {
		if (variants.length === 1) return; // Prevent removing last variant
		setVariants((prev) => prev.filter((v) => v.id !== id));
	};

	const handleVariantChange = (
		id: string,
		field: keyof Variant,
		value: string,
	) => {
		setVariants((prev) =>
			prev.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
		);
	};

	// Attribute Actions
	const addAttribute = (variantId: string) => {
		setVariants((prev) =>
			prev.map((v) =>
				v.id === variantId
					? { ...v, attributes: [...v.attributes, { name: "", value: "" }] }
					: v,
			),
		);
	};

	const removeAttribute = (variantId: string, index: number) => {
		setVariants((prev) =>
			prev.map((v) => {
				if (v.id !== variantId) return v;
				const newAttrs = [...v.attributes];
				newAttrs.splice(index, 1);
				return { ...v, attributes: newAttrs };
			}),
		);
	};

	const handleAttributeChange = (
		variantId: string,
		index: number,
		field: keyof VariantAttribute,
		value: string,
	) => {
		setVariants((prev) =>
			prev.map((v) => {
				if (v.id !== variantId) return v;
				const newAttrs = [...v.attributes];
				if (newAttrs[index]) {
					newAttrs[index] = { ...newAttrs[index], [field]: value };
				}
				return { ...v, attributes: newAttrs };
			}),
		);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		const payload = {
			...productData,
			variants: variants.map(({ id, ...rest }) => rest),
			keepPurchaseRecord,
		};

		console.log("Submitting product:", payload);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		setLoading(false);
		setIsOpen(false);
		setProductData({
			name: "",
			categoryId: "",
			supplierName: "",
		});
		setVariants([
			{
				id: Math.random().toString(36).substr(2, 9),
				costPrice: "",
				sellingPrice: "",
				stock: "0",
				attributes: [{ name: "", value: "" }],
			},
		]);
		setKeepPurchaseRecord(false);
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button className="flex items-center gap-2 px-2">
					<Plus className="w-4 h-4" />
					<span className="text-white">Add Product</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="overflow-y-auto sm:max-w-[600px] w-full p-0">
				<SheetHeader className="p-6 pb-2 border-b border-gray-100">
					<SheetTitle className="text-xl font-semibold tracking-tight">
						Add New Product
					</SheetTitle>
					<SheetDescription className="text-sm text-muted-foreground mt-1">
						Enter product details and variants below.
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col h-[calc(100vh-120px)]"
				>
					<div className="flex-1 overflow-y-auto p-6 space-y-8">
						{/* Product Details Section */}
						<div className="space-y-4">
							<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
								Product Details
							</h3>

							<div className="grid gap-2">
								<Label htmlFor="name" className="text-sm font-medium">
									Product Name
								</Label>
								<Input
									id="name"
									name="name"
									value={productData.name}
									onChange={handleProductChange}
									placeholder="e.g. Cotton T-Shirt"
									required
									className="h-10"
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="categoryId" className="text-sm font-medium">
									Category
								</Label>
								<div className="relative">
									<select
										id="categoryId"
										name="categoryId"
										value={productData.categoryId}
										onChange={handleProductChange}
										className={cn(
											"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
										)}
										required
									>
										<option value="" disabled>
											Select a category
										</option>
										<option value="electronics">Electronics</option>
										<option value="clothing">Clothing</option>
										<option value="groceries">Groceries</option>
									</select>
									<div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-muted-foreground">
										<svg
											className="w-4 h-4"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M19 9l-7 7-7-7"
											/>
										</svg>
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-6">
							<div className="flex items-center justify-between border-b pb-2">
								<h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
									Product Variants
								</h3>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={addVariant}
									className="text-xs h-7"
								>
									<Plus className="w-3 h-3 mr-1" /> Add Variant
								</Button>
							</div>

							<div className="space-y-6">
								{variants.map((variant, variantIndex) => (
									<div
										key={variant.id}
										className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 relative"
									>
										{variants.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500"
												onClick={() => removeVariant(variant.id)}
											>
												<span className="sr-only">Remove</span>
												<svg
													className="w-4 h-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</Button>
										)}

										<div className="grid gap-4">
											<div className="space-y-3">
												<Label className="text-xs font-semibold text-gray-500">
													Attributes
												</Label>
												{variant.attributes.map((attr, attrIndex) => (
													<div
														key={attrIndex}
														className="flex gap-2 items-center"
													>
														<Input
															placeholder="Name (e.g. Size)"
															value={attr.name}
															onChange={(e) =>
																handleAttributeChange(
																	variant.id,
																	attrIndex,
																	"name",
																	e.target.value,
																)
															}
															className="h-8 text-sm flex-1"
															required
														/>
														<Input
															placeholder="Value (e.g. M)"
															value={attr.value}
															onChange={(e) =>
																handleAttributeChange(
																	variant.id,
																	attrIndex,
																	"value",
																	e.target.value,
																)
															}
															className="h-8 text-sm flex-1"
															required
														/>
														{variant.attributes.length > 1 && (
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
																onClick={() =>
																	removeAttribute(variant.id, attrIndex)
																}
															>
																<svg
																	className="w-4 h-4"
																	fill="none"
																	viewBox="0 0 24 24"
																	stroke="currentColor"
																>
																	<path
																		strokeLinecap="round"
																		strokeLinejoin="round"
																		strokeWidth={2}
																		d="M20 12H4"
																	/>
																</svg>
															</Button>
														)}
													</div>
												))}
												<Button
													type="button"
													variant="link"
													size="sm"
													className="px-0 h-auto text-xs text-blue-600"
													onClick={() => addAttribute(variant.id)}
												>
													+ Add Attribute
												</Button>
											</div>

											<div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
												<div>
													<Label className="text-xs font-medium mb-1.5 block">
														Cost
													</Label>
													<Input
														type="number"
														min="0"
														step="0.01"
														placeholder="0.00"
														value={variant.costPrice}
														onChange={(e) =>
															handleVariantChange(
																variant.id,
																"costPrice",
																e.target.value,
															)
														}
														className="h-9"
														required
													/>
												</div>
												<div>
													<Label className="text-xs font-medium mb-1.5 block">
														Selling
													</Label>
													<Input
														type="number"
														min="0"
														step="0.01"
														placeholder="0.00"
														value={variant.sellingPrice}
														onChange={(e) =>
															handleVariantChange(
																variant.id,
																"sellingPrice",
																e.target.value,
															)
														}
														className="h-9"
														required
													/>
												</div>
												<div>
													<Label className="text-xs font-medium mb-1.5 block">
														Stock
													</Label>
													<Input
														type="number"
														min="0"
														placeholder="0"
														value={variant.stock}
														onChange={(e) =>
															handleVariantChange(
																variant.id,
																"stock",
																e.target.value,
															)
														}
														className="h-9"
														required
													/>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-4 pt-2 border-t border-gray-50">
							<div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100/80">
								<Checkbox
									id="keepPurchaseRecord"
									checked={keepPurchaseRecord}
									onCheckedChange={(checked) =>
										setKeepPurchaseRecord(checked as boolean)
									}
									className="mt-1"
								/>
								<div className="grid gap-1.5 leading-none">
									<Label
										htmlFor="keepPurchaseRecord"
										className="font-medium cursor-pointer"
									>
										Log Purchase Record
									</Label>
									<p className="text-xs text-muted-foreground">
										Create a purchase entry for the initial stock of all variants.
									</p>
								</div>
							</div>

							{keepPurchaseRecord && (
								<div className="grid gap-2 pl-2 animate-in slide-in-from-top-2 fade-in duration-200">
									<Label htmlFor="supplierName" className="text-sm font-medium">
										Supplier Name
									</Label>
									<Input
										id="supplierName"
										name="supplierName"
										value={productData.supplierName}
										onChange={handleProductChange}
										placeholder="e.g. Tech Distributors Inc."
										required={keepPurchaseRecord}
										className="h-10 bg-white"
									/>
								</div>
							)}
						</div>
					</div>

					<SheetFooter className="p-6 border-t border-gray-100 bg-white sm:justify-between sticky bottom-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsOpen(false)}
							className="w-full sm:w-auto"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading}
							className="w-full sm:w-auto"
						>
							{loading ? "Saving..." : "Save Product"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
