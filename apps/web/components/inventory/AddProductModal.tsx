"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
import { useForm, useFieldArray, Control, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, CreateProductInput } from "@kosh/validation";

interface AttributeListProps {
	variantIndex: number;
	control: Control<CreateProductInput>;
}

function AttributeList({ variantIndex, control }: AttributeListProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: `variants.${variantIndex}.attributes`,
	});

	return (
		<div className="space-y-3">
			<Label className="text-xs font-semibold text-gray-500">Attributes</Label>
			{fields.map((attr, attrIndex) => (
				<div key={attr.id} className="flex gap-2 items-start">
					<div className="flex-1">
						<Controller
							control={control}
							name={`variants.${variantIndex}.attributes.${attrIndex}.name`}
							render={({ field, fieldState }) => (
								<>
									<Input
										placeholder="Name (e.g. Size)"
										className={cn("h-8 text-sm", fieldState.error && "border-red-500")}
										{...field}
									/>
								</>
							)}
						/>
					</div>
					<div className="flex-1">
						<Controller
							control={control}
							name={`variants.${variantIndex}.attributes.${attrIndex}.value`}
							render={({ field, fieldState }) => (
								<>
									<Input
										placeholder="Value (e.g. M)"
										className={cn("h-8 text-sm", fieldState.error && "border-red-500")}
										{...field}
									/>
								</>
							)}
						/>
					</div>
					{fields.length > 1 && (
						<Button
							type="button"
							variant="ghost"
							size="icon"
							className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-500"
							onClick={() => remove(attrIndex)}
						>
							<Trash2 className="w-4 h-4" />
						</Button>
					)}
				</div>
			))}
			<Button
				type="button"
				variant="link"
				size="sm"
				className="px-0 h-auto text-xs text-blue-600"
				onClick={() => append({ name: "", value: "" })}
			>
				+ Add Attribute
			</Button>
		</div>
	);
}

export function AddProductModal() {
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	const form = useForm<CreateProductInput>({
		resolver: zodResolver(createProductSchema),
		defaultValues: {
			name: "",
			categoryId: "",
			supplierName: "",
			keepPurchaseRecord: false,
			variants: [
				{
					costPrice: "",
					sellingPrice: "",
					stock: "0",
					attributes: [{ name: "", value: "" }],
				},
			],
		},
	});

	const {
		control,
		handleSubmit,
		register,
		watch,
		reset,
		formState: { errors },
	} = form;

	const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
		control,
		name: "variants",
	});

	const keepPurchaseRecord = watch("keepPurchaseRecord");

	const onSubmit = async (data: CreateProductInput) => {
		setLoading(true);
		console.log("Submitting product:", data);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		setLoading(false);
		setIsOpen(false);
		reset();
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			<SheetTrigger asChild>
				<Button className="flex items-center gap-2 px-2">
					<Plus className="w-4 h-4" />
					<span className="text-white">Add Product</span>
				</Button>
			</SheetTrigger>
			<SheetContent className="max-h-screen sm:max-w-[600px] w-full p-0">
				<SheetHeader className="p-6 pb-2 border-b border-gray-100">
					<SheetTitle className="text-xl font-semibold tracking-tight">
						Add New Product
					</SheetTitle>
					<SheetDescription className="text-sm text-muted-foreground mt-1">
						Enter product details and variants below.
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
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
									placeholder="e.g. Cotton T-Shirt"
									className={cn("h-10", errors.name && "border-red-500")}
									{...register("name")}
								/>
								{errors.name && (
									<p className="text-xs text-red-500">{errors.name.message}</p>
								)}
							</div>

							<div className="grid gap-2">
								<Label htmlFor="categoryId" className="text-sm font-medium">
									Category
								</Label>
								<div className="relative">
									<select
										id="categoryId"
										className={cn(
											"flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
											errors.categoryId && "border-red-500"
										)}
										{...register("categoryId")}
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
								{errors.categoryId && (
									<p className="text-xs text-red-500">{errors.categoryId.message}</p>
								)}
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
									onClick={() =>
										appendVariant({
											costPrice: "",
											sellingPrice: "",
											stock: "0",
											attributes: [{ name: "", value: "" }],
										})
									}
									className="text-xs h-7"
								>
									<Plus className="w-3 h-3 mr-1" /> Add Variant
								</Button>
							</div>

							<div className="space-y-6">
								{variantFields.map((variant, index) => (
									<div
										key={variant.id}
										className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 relative"
									>
										{variantFields.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute top-2 right-2 h-6 w-6 text-gray-400 hover:text-red-500"
												onClick={() => removeVariant(index)}
											>
												<span className="sr-only">Remove</span>
												<Trash2 className="w-4 h-4" />
											</Button>
										)}

										<div className="grid gap-4">
											<AttributeList variantIndex={index} control={control} />

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
														className={cn("h-9", errors.variants?.[index]?.costPrice && "border-red-500")}
														{...register(`variants.${index}.costPrice`)}
													/>
													{errors.variants?.[index]?.costPrice && (
														<p className="text-xs text-red-500">{errors.variants[index]?.costPrice?.message}</p>
													)}
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
														className={cn("h-9", errors.variants?.[index]?.sellingPrice && "border-red-500")}
														{...register(`variants.${index}.sellingPrice`)}
													/>
													{errors.variants?.[index]?.sellingPrice && (
														<p className="text-xs text-red-500">{errors.variants[index]?.sellingPrice?.message}</p>
													)}
												</div>
												<div>
													<Label className="text-xs font-medium mb-1.5 block">
														Stock
													</Label>
													<Input
														type="number"
														min="0"
														placeholder="0"
														className={cn("h-9", errors.variants?.[index]?.stock && "border-red-500")}
														{...register(`variants.${index}.stock`)}
													/>
													{errors.variants?.[index]?.stock && (
														<p className="text-xs text-red-500">{errors.variants[index]?.stock?.message}</p>
													)}
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-4 pt-2 border-t border-gray-50">
							<div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg transition-colors hover:bg-gray-100/80">
								<Controller
									control={control}
									name="keepPurchaseRecord"
									render={({ field }) => (
										<Checkbox
											id="keepPurchaseRecord"
											checked={field.value}
											onCheckedChange={field.onChange}
											className="mt-1"
										/>
									)}
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
										placeholder="e.g. Tech Distributors Inc."
										className={cn("h-10 bg-white", errors.supplierName && "border-red-500")}
										{...register("supplierName")}
									/>
									{errors.supplierName && (
										<p className="text-xs text-red-500">{errors.supplierName.message}</p>
									)}
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
