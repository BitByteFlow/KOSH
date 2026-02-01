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
	const [selectedCategory, setSelectedCategory] = useState(product?.category || "");
	const [loading, setLoading] = useState(false);

	const handleSave = async () => {
		if (!product) return;
		setLoading(true);
		try {
			await onSave(product.id, selectedCategory);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to change category", error);
		} finally {
			setLoading(false);
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
						>
							<option value="electronics">Electronics</option>
							<option value="clothing">Clothing</option>
							<option value="groceries">Groceries</option>
							<option value="furniture">Furniture</option>
						</select>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={handleSave} disabled={loading}>
						{loading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
