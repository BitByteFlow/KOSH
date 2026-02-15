"use client";

import { useState } from "react";
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
import { useCategoryList, useUpdateProduct } from "../hooks/useProducts";
import { Category } from "@/services/categories.service";
import { toast } from "sonner";
import { useEffect } from "react";

interface ChangeCategoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: any;
	onSave: (productId: string, newCategory: string) => Promise<void>;
}

export function ChangeCategoryDialog({
	open,
	onOpenChange,
	product,
	onSave,
}: ChangeCategoryDialogProps) {
	const { data: categoryData, isLoading: categoriesLoading } = useCategoryList();
	const updateProduct = useUpdateProduct();
	const [selectedCategory, setSelectedCategory] = useState(product?.category || "");

	// Reset selection when product changes
	useEffect(() => {
		if (product) {
			setSelectedCategory(product.categoryId || "");
		}
	}, [product]);

	const handleSave = async () => {
		if (!product || !selectedCategory) return;

		try {
			await updateProduct.mutateAsync({
				id: product.id,
				data: { categoryId: selectedCategory }
			});
			toast.success("Category updated successfully");
			onOpenChange(false);
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
							{categoryData?.categories.map((cat: Category) => (
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
					<Button onClick={handleSave} disabled={updateProduct.isPending || selectedCategory === product?.categoryId}>
						{updateProduct.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
