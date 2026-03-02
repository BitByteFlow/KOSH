"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@kosh/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { Label } from "@kosh/ui/components/label";
import { toast } from "sonner";
import { useCategoryList, useUpdateProduct } from "../hooks/useProducts";

interface ChangeCategoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: any;
	onSave?: (productId: string, newCategory: string) => Promise<void>;
}

export function ChangeCategoryDialog({
	open,
	onOpenChange,
	product,
}: ChangeCategoryDialogProps) {
	const { data: rawCategoryData, loading: categoriesLoading } = useCategoryList();
	const [updateProductMutation, { loading: isUpdating }] = useUpdateProduct();
	const [selectedCategory, setSelectedCategory] = useState(product?.category?.id || "");

	const categories = useMemo(() =>
		rawCategoryData?.getCategories?.data ?? [],
		[rawCategoryData?.getCategories?.data]
	);

	// Reset selection when product changes
	useEffect(() => {
		if (product) {
			setSelectedCategory(product.category?.id || "");
		}
	}, [product]);

	const handleSave = async () => {
		if (!product || !selectedCategory) return;

		try {
			const { data }: any = await updateProductMutation({
				variables: {
					productId: product.id,
					input: {
						name: product.productName,
						categoryId: selectedCategory
					}
				}
			});

			if (data?.updateProduct?.success) {
				toast.success("Category updated successfully");
				onOpenChange(false);
			} else {
				toast.error(data?.updateProduct?.message || "Failed to update category");
			}
		} catch (error) {
			toast.error("Failed to update category");
			console.error("Failed to change category", error);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Category</DialogTitle>
					<DialogDescription>
						Select a new category for <strong>{product?.productName}</strong>.
					</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label htmlFor="category">Category</Label>
						<select
							id="category"
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
							disabled={categoriesLoading}
						>
							<option value="" disabled>Select a category</option>
							{categories?.map((cat: any) => (
								<option key={cat.id} value={cat.id}>
									{cat.name}
								</option>
							))}
						</select>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={isUpdating || selectedCategory === product?.category?.id}>
						{isUpdating ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
