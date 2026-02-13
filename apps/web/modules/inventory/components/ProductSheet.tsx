"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ChevronDown, Save, Loader2, Package } from "lucide-react";
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
import { useForm, useFieldArray, type Control, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductRequestSchema as createProductSchema, type CreateProductRequestInput as CreateProductInput } from "@kosh/validation";
import { useCreateProduct, useCategoryList } from "../hooks/useProducts";
import { toast } from "sonner";

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
								<Input
									placeholder="Name (e.g. Size)"
									className={cn("h-8 text-sm", fieldState.error && "border-red-500")}
									{...field}
								/>
							)}
						/>
					</div>
					<div className="flex-1">
						<Controller
							control={control}
							name={`variants.${variantIndex}.attributes.${attrIndex}.value`}
							render={({ field, fieldState }) => (
								<Input
									placeholder="Value (e.g. M)"
									className={cn("h-8 text-sm", fieldState.error && "border-red-500")}
									{...field}
								/>
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
			{fields.length < 5 && (
				<Button
					type="button"
					variant="link"
					size="sm"
					className="px-0 h-auto text-xs text-blue-600"
					onClick={() => append({ name: "", value: "" })}
				>
					+ Add Attribute
				</Button>
			)}
		</div>
	);
}

interface ProductSheetProps {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	trigger?: React.ReactNode;
	product?: any;
}

export function ProductSheet({
	open,
	onOpenChange,
	trigger,
	product,
}: ProductSheetProps) {
	const [internalOpen, setInternalOpen] = useState(false);
	const { data: categories, isLoading: categoriesLoading } = useCategoryList();
	const createProduct = useCreateProduct();

	const isControlled = open !== undefined && onOpenChange !== undefined;
	const isOpen = isControlled ? open : internalOpen;
	const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

	const form = useForm<CreateProductInput>({
		resolver: zodResolver(createProductSchema),
		defaultValues: {
			name: "",
			categoryId: "",
			supplierName: "",
			keepPurchaseRecord: false,
			variants: [
				{
					costPrice: 0,
					sellingPrice: 0,
					stock: 0,
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

	useEffect(() => {
		if (isOpen && !product) {
			reset({
				name: "",
				categoryId: "",
				supplierName: "",
				keepPurchaseRecord: false,
				variants: [
					{
						costPrice: 0,
						sellingPrice: 0,
						stock: 0,
						attributes: [{ name: "", value: "" }],
					},
				],
			});
		}
	}, [isOpen, product, reset]);

	const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
		control,
		name: "variants",
	});

	const keepPurchaseRecord = watch("keepPurchaseRecord");

	const onSubmit = async (data: CreateProductInput) => {
		try {
			// Format data for backend
			const payload = {
				name: data.name,
				categoryId: data.categoryId,
				createPurchaseRecord: data.keepPurchaseRecord,
				supplierName: data.keepPurchaseRecord ? data.supplierName : undefined,
				variants: data.variants.map(v => ({
					costPrice: v.costPrice,
					sellingPrice: v.sellingPrice,
					stock: v.stock,
					attributes: v.attributes?.filter(attr => attr.name && attr.value)
					//TODO: add validation for attributes
				}))
			};

			await createProduct.mutateAsync(payload);
			toast.success("Product created successfully");
			setIsOpen(false);
			reset();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to create product");
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={setIsOpen}>
			{trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
			<SheetContent className="max-h-screen sm:max-w-[600px] w-full p-0 flex flex-col">
				<SheetHeader className="p-6 pb-2 border-b border-gray-100 bg-white sticky top-0 z-10">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-primary/5 rounded-xl">
							<Package className="h-5 w-5 text-primary" />
						</div>
						<div>
							<SheetTitle className="text-xl font-semibold tracking-tight">
								{product ? "Edit Product" : "Add New Product"}
							</SheetTitle>
							<SheetDescription className="text-sm text-muted-foreground mt-0.5">
								{product ? "Update product details and variants." : "Enter product details and variants below."}
							</SheetDescription>
						</div>
					</div>
				</SheetHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col flex-1 overflow-hidden"
				>
					<div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">
						{/* Product Details Section */}
						<div className="space-y-6">
							<div className="space-y-4">
								<h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
									Product Information
								</h3>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="name" className="text-[11px] font-bold uppercase text-muted-foreground">
											Product Name *
										</Label>
										<Input
											id="name"
											placeholder="e.g. Cotton T-Shirt"
											className={cn("h-10 bg-white rounded-xl shadow-sm border-gray-100", errors.name && "border-red-500")}
											{...register("name")}
										/>
										{errors.name && (
											<p className="text-xs text-red-500">{errors.name.message}</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="categoryId" className="text-[11px] font-bold uppercase text-muted-foreground">
											Category *
										</Label>
										<div className="relative">
											<select
												id="categoryId"
												disabled={categoriesLoading}
												className={cn(
													"flex h-10 w-full rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 appearance-none disabled:bg-gray-50",
													errors.categoryId && "border-red-500"
												)}
												{...register("categoryId")}
											>
												<option value="" disabled>
													{categoriesLoading ? "Loading..." : "Select a category"}
												</option>
												{/* TODO: Fix this */}
												{categories?.map((cat) => (
													<option key={cat.id} value={cat.id}>
														{cat.name}
													</option>
												))}
											</select>
											<div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-muted-foreground">
												<ChevronDown className="w-4 h-4" />
											</div>
										</div>
										{errors.categoryId && (
											<p className="text-xs text-red-500">{errors.categoryId.message}</p>
										)}
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
									Variants & Inventory
								</h3>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() =>
										appendVariant({
											costPrice: 0,
											sellingPrice: 0,
											stock: 0,
											attributes: [{ name: "", value: "" }],
										})
									}
									className="h-8 rounded-full bg-white shadow-sm border-gray-100"
								>
									<Plus className="w-3.5 h-3.5 mr-1.5" /> Add Variant
								</Button>
							</div>

							<div className="space-y-4">
								{variantFields.map((variant, index) => (
									<div
										key={variant.id}
										className="group p-5 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all relative space-y-4"
									>
										{variantFields.length > 1 && (
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="absolute top-2 right-2 h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 hover:bg-red-50 rounded-full"
												onClick={() => removeVariant(index)}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										)}

										<AttributeList variantIndex={index} control={control} />

										<div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-50">
											<div className="space-y-2">
												<Label className="text-[11px] font-bold uppercase text-muted-foreground">
													Cost Price
												</Label>
												<div className="relative group/input">
													<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">Rs</span>
													<Input
														type="number"
														min="0"
														step="0.01"
														placeholder="0.00"
														className={cn("h-9 pl-9 bg-gray-50/50 border-transparent focus:bg-white transition-colors rounded-xl", errors.variants?.[index]?.costPrice && "border-red-500")}
														{...register(`variants.${index}.costPrice`)}
													/>
												</div>
											</div>
											<div className="space-y-2">
												<Label className="text-[11px] font-bold uppercase text-muted-foreground">
													Sale Price
												</Label>
												<div className="relative">
													<span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold">Rs</span>
													<Input
														type="number"
														min="0"
														step="0.01"
														placeholder="0.00"
														className={cn("h-9 pl-9 bg-gray-50/50 border-transparent focus:bg-white transition-colors rounded-xl", errors.variants?.[index]?.sellingPrice && "border-red-500")}
														{...register(`variants.${index}.sellingPrice`)}
													/>
												</div>
											</div>
											<div className="space-y-2">
												<Label className="text-[11px] font-bold uppercase text-muted-foreground">
													Stock
												</Label>
												<Input
													type="number"
													min="0"
													placeholder="0"
													className={cn("h-9 bg-gray-50/50 border-transparent focus:bg-white transition-colors rounded-xl", errors.variants?.[index]?.stock && "border-red-500")}
													{...register(`variants.${index}.stock`)}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-4 pt-2 border-t border-gray-100">
							<div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 transition-colors">
								<Controller
									control={control}
									name="keepPurchaseRecord"
									render={({ field }) => (
										<Checkbox
											id="keepPurchaseRecord"
											checked={field.value}
											onCheckedChange={field.onChange}
											className="mt-1 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
										/>
									)}
								/>
								<div className="grid gap-1.5 leading-none">
									<Label
										htmlFor="keepPurchaseRecord"
										className="text-sm font-bold text-primary cursor-pointer"
									>
										Initial Stock Purchase Log
									</Label>
									<p className="text-xs text-primary/60">
										Automatically record a purchase entry for the initial stock. This will subtract from your cash balance.
									</p>
								</div>
							</div>

							{keepPurchaseRecord && (
								<div className="grid gap-2 pl-4 animate-in slide-in-from-top-2 fade-in duration-300">
									<Label htmlFor="supplierName" className="text-[11px] font-bold uppercase text-muted-foreground">
										Supplier Name
									</Label>
									<Input
										id="supplierName"
										placeholder="e.g. Main Vendor"
										className={cn("h-10 bg-white rounded-xl shadow-sm border-gray-100", errors.supplierName && "border-red-500")}
										{...register("supplierName", { required: keepPurchaseRecord })}
									/>
									{errors.supplierName && (
										<p className="text-xs text-red-500">{errors.supplierName.message}</p>
									)}
								</div>
							)}
						</div>
					</div>

					<SheetFooter className="p-6 border-t border-gray-100 bg-white sm:justify-between sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsOpen(false)}
							className="rounded-xl px-8"
						>
							Discard
						</Button>
						<Button
							type="submit"
							disabled={createProduct.isPending}
							className="rounded-xl px-8 shadow-md shadow-primary/20 gap-2 min-w-[140px]"
						>
							{createProduct.isPending ? (
								<>
									<Loader2 className="h-4 w-4 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="h-4 w-4" />
									{product ? "Update Product" : "Create Product"}
								</>
							)}
						</Button>
					</SheetFooter>
				</form>
				<style jsx global>{`
					select {
						background-image: none !important;
					}
				`}</style>
			</SheetContent>
		</Sheet>
	);
}
