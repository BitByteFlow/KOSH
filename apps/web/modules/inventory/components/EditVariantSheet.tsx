"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray, type Control, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { variantDtoSchema, type VariantDtoInput } from "@kosh/validation";
import { Button } from "@kosh/ui/components/button";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@kosh/ui/components/sheet";
import { cn } from "@kosh/ui/lib/utils";
import { Trash2 } from "lucide-react";

interface EditVariantSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	variant?: any;
	onSave: (variant: VariantDtoInput) => Promise<void>;
}

interface AttributeListProps {
	control: Control<VariantDtoInput>;
}

function AttributeList({ control }: AttributeListProps) {
	const { fields, append, remove } = useFieldArray({
		control,
		name: "attributes",
	});

	return (
		<div className="space-y-3">
			<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attributes</Label>
			{fields.map((attr, index) => (
				<div key={attr.id} className="flex gap-2 items-start">
					<div className="flex-1">
						<Controller
							control={control}
							name={`attributes.${index}.name`}
							render={({ field, fieldState }) => (
								<Input
									placeholder="Name (e.g. Size)"
									className={cn("h-8 text-sm transition-colors", fieldState.error && "border-destructive ring-destructive/20")}
									{...field}
								/>
							)}
						/>
					</div>
					<div className="flex-1">
						<Controller
							control={control}
							name={`attributes.${index}.value`}
							render={({ field, fieldState }) => (
								<Input
									placeholder="Value (e.g. M)"
									className={cn("h-8 text-sm transition-colors", fieldState.error && "border-destructive ring-destructive/20")}
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
							className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
							onClick={() => remove(index)}
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
				className="px-0 h-auto text-xs text-info hover:text-info/80"
				onClick={() => append({ name: "", value: "" })}
			>
				+ Add Attribute
			</Button>
		</div>
	);
}

export function EditVariantSheet({
	open,
	onOpenChange,
	variant,
	onSave,
}: EditVariantSheetProps) {
	const [loading, setLoading] = useState(false);

	const form = useForm<VariantDtoInput>({
		resolver: zodResolver(variantDtoSchema),
		defaultValues: {
			costPrice: 0,
			sellingPrice: 0,
			stock: 0,
			attributes: [],
		},
	});

	const {
		control,
		handleSubmit,
		register,
		reset,
		formState: { errors },
	} = form;

	useEffect(() => {
		if (variant) {
			reset({
				id: variant.id,
				costPrice: variant.costPrice || 0,
				sellingPrice: variant.sellPrice || variant.price || 0,
				stock: variant.stock || 0,
				attributes: variant.attributes?.map((attr: any) => ({
					name: attr.name,
					value: attr.value,
				})) || [],
			});
		}
	}, [variant, reset]);

	const onSubmit = async (data: VariantDtoInput) => {
		setLoading(true);
		try {
			await onSave(data);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to update variant:", error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="overflow-y-auto sm:max-w-[500px] w-full p-0 bg-card">
				<SheetHeader className="p-6 pb-2 border-b border-border">
					<SheetTitle className="text-xl font-semibold tracking-tight">
						Edit Variant
					</SheetTitle>
					<SheetDescription className="text-sm text-muted-foreground mt-1">
						Update the variant details below.
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col h-[calc(100vh-120px)]"
				>
					<div className="flex-1 overflow-y-auto p-6 space-y-6">
						<AttributeList control={control} />

						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="costPrice" className="text-sm font-medium">
									Cost Price
								</Label>
								<Input
									id="costPrice"
									type="number"
									min="0"
									step="0.01"
									placeholder="0.00"
									className={cn("h-9 transition-colors", errors.costPrice && "border-destructive ring-destructive/20")}
									{...register("costPrice", { valueAsNumber: true })}
								/>
								{errors.costPrice && (
									<p className="text-xs text-destructive mt-1">{errors.costPrice.message}</p>
								)}
							</div>
							<div className="space-y-2">
								<Label htmlFor="sellingPrice" className="text-sm font-medium">
									Selling Price
								</Label>
								<Input
									id="sellingPrice"
									type="number"
									min="0"
									step="0.01"
									placeholder="0.00"
									className={cn("h-9", errors.sellingPrice && "border-red-500")}
									{...register("sellingPrice", { valueAsNumber: true })}
								/>
								{errors.sellingPrice && (
									<p className="text-xs text-red-500">{errors.sellingPrice.message}</p>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="stock" className="text-sm font-medium">
								Stock
							</Label>
							<Input
								id="stock"
								type="number"
								min="0"
								placeholder="0"
								className={cn("h-9", errors.stock && "border-red-500")}
								{...register("stock", { valueAsNumber: true })}
							/>
							{errors.stock && (
								<p className="text-xs text-destructive">{errors.stock.message}</p>
							)}
						</div>
					</div>

					<SheetFooter className="p-6 border-t border-border bg-card sm:justify-between sticky bottom-0">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="w-full sm:w-auto"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							disabled={loading || !form.formState.isDirty}
							className="w-full sm:w-auto"
						>
							{loading ? "Saving..." : "Save Changes"}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
