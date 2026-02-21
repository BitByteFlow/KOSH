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
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@/gql";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";

interface ChangeCategoryDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	product?: any;
	onSave?: (productId: string, newCategory: string) => Promise<void>;
}

const GET_CATEGORIES = gql(`
	query GetCategoriesInDialog {
		getCategories {
			success
			message
			data {
				id
				name
			}
		}
	}
`);

const UPDATE_PRODUCT_CATEGORY = gql(`
	mutation UpdateProductCategoryInDialog($productId: ID!, $updateProductInput: UpdateProductInput!) {
		updateProduct(productId: $productId, updateProductInput: $updateProductInput) {
			success
			message
			data {
				id
				productName
				category {
					id
					name
				}
				totalStock
				variantCount
				status
				variants {
					id
					sku
					barcode
					attributes {
						name
						value
					}
					price
					stock
					lowStock
					status
					sellingPrice
					costPrice
				}
			}
		}
	}
`);

export function ChangeCategoryDialog({
	open,
	onOpenChange,
	product,
}: ChangeCategoryDialogProps) {
	const { data: rawCategoryData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);
	const [updateProductMutation, { loading: isUpdating }] = useMutation(UPDATE_PRODUCT_CATEGORY);
	const [selectedCategory, setSelectedCategory] = useState(product?.category?.id || "");

	const categories = useMemo(() =>
		parseGraphQLListResponse(rawCategoryData?.getCategories),
		[rawCategoryData?.getCategories]
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
					updateProductInput: {
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
							{categories.data?.map((cat) => (
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
