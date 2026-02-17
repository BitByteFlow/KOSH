"use client";

import { useState, useMemo } from "react";
import { InventorySearch } from "@/modules/inventory/components/InventorySearch";
import InventoryItem from "@/modules/inventory/components/InventoryItem";
import { InventoryPagination } from "@/modules/inventory/components/InventoryPagination";
import { ProductSheet } from "@/modules/inventory/components/ProductSheet";
import { ProductDetailsSheet } from "@/modules/inventory/components/ProductDetailsSheet";
import { ChangeCategoryDialog } from "@/modules/inventory/components/ChangeCategoryDialog";
import { BarcodeDialog } from "@/modules/inventory/components/BarcodeDialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { useProductList } from "@/modules/inventory/hooks/useProducts";
import { useDebounce } from "@/components/useDebounce";
import { TransactionTableSkeleton } from "@/components/TableSkeleton";
import { useDeleteProduct, useUpdateProduct, useUpdateVariant } from "@/modules/inventory/hooks/useProducts";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { Button } from "@kosh/ui/components/button";

export default function InventoryPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 500);

	const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<string | null>(null);
	const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
	const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);

	const [editingProduct, setEditingProduct] = useState<any>(null);
	const [viewingProduct, setViewingProduct] = useState<any>(null);
	const [categoryProduct, setCategoryProduct] = useState<any>(null);

	const {
		data: inventoryData,
		isLoading,
		isError,
		isPending,
		error
	} = useProductList({
		page: currentPage,
		limit: itemsPerPage,
		search: debouncedSearch,
		categoryId: categoryFilter || undefined,
		status: statusFilter || undefined,
	});

	const deleteProduct = useDeleteProduct();
	const updateVariant = useUpdateVariant();
	const [productToDelete, setProductToDelete] = useState<string | null>(null);

	const products = inventoryData?.data || [];
	const meta = inventoryData?.meta;
	const totalPages = meta?.totalPages || 0;
	const totalItems = meta?.total || 0;

	const handleToggleSelection = (id: string) => {
		setSelectedProductIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			const allIds = products.map((p) => p.id);
			setSelectedProductIds(new Set([...Array.from(selectedProductIds), ...allIds]));
		} else {
			const currentIds = products.map((p) => p.id);
			setSelectedProductIds((prev) => {
				const newSet = new Set(prev);
				currentIds.forEach((id) => newSet.delete(id));
				return newSet;
			});
		}
	};

	const isAllSelected = products.length > 0 && products.every((p) => selectedProductIds.has(p.id));

	const selectedProducts = useMemo(() => {
		return products.filter((p) => selectedProductIds.has(p.id));
	}, [products, selectedProductIds]);

	const handleEditProduct = (id: string) => {
		const product = products.find((p) => p.id === id);
		if (product) setEditingProduct(product);
	};

	const handleViewDetails = (id: string) => {
		const product = products.find((p) => p.id === id);
		if (product) setViewingProduct(product);
	};

	const handleChangeCategory = (id: string) => {
		const product = products.find((p) => p.id === id);
		if (product) setCategoryProduct(product);
	};

	const handleDeleteProduct = (id: string) => {
		setProductToDelete(id);
	};

	const confirmDelete = async () => {
		if (productToDelete) {
			try {
				await deleteProduct.mutateAsync(productToDelete);
				toast.success("Product deleted successfully");
				setProductToDelete(null);
			} catch (error) {
				toast.error("Failed to delete product");
			}
		}
	};

	return (
		<div className="flex-1 flex flex-col h-screen bg-background">
			<div className="border-b border-border px-8 py-6 flex items-center justify-between sticky top-0 bg-background z-10">
				<h1 className="text-2xl font-bold">Inventory</h1>
			</div>

			<div className="flex-1 overflow-auto px-8 py-6">
				<div className="space-y-6">
					<InventorySearch
						onSearch={setSearchQuery}
						onCategoryFilter={setCategoryFilter}
						onStatusFilter={setStatusFilter}
						onGenerateBarcodes={() => setIsBarcodeDialogOpen(true)}
						selectedCount={selectedProductIds.size}
						activeCategoryId={categoryFilter}
						activeStatus={statusFilter}
					/>
					{isPending ? (
						<TransactionTableSkeleton />
					) : (
						<div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
							<Table>
								<TableHeader className="bg-gray-50/50">
									<TableRow className="border-border">
										<TableHead className="w-12 pl-6">
											<input
												type="checkbox"
												checked={isAllSelected}
												onChange={(e) => handleSelectAll(e.target.checked)}
												className="w-4 h-4 rounded border-gray-300 cursor-pointer"
											/>
										</TableHead>
										<TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-12">
											Product Name
										</TableHead>
										<TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-12">
											Category
										</TableHead>
										<TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-12">
											Total Stock
										</TableHead>
										<TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider h-12">
											Status
										</TableHead>
										<TableHead className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider h-12 pr-6">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{products.map((product) => (
										<InventoryItem
											key={product.id}
											{...product}
											isSelected={selectedProductIds.has(product.id)}
											onToggleSelection={handleToggleSelection}
											onEdit={handleEditProduct}
											onViewDetails={handleViewDetails}
											onChangeCategory={handleChangeCategory}
											onDelete={handleDeleteProduct}
											onEditVariant={(id) => console.log("Edit variant:", id)}
											onUpdateVariant={async (variant) => {
												try {
													await updateVariant.mutateAsync({
														productId: product.id,
														variantId: variant.id,
														data: variant,
													});
													toast.success("Variant updated successfully");
												} catch (error) {
													toast.error("Failed to update variant");
												}
											}}
										/>
									))}
									{products.length === 0 && (
										<TableRow>
											<TableCell
												colSpan={6}
												className="h-24 text-center"
											>
												No products found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					)}

					{!isLoading && !isError && products.length > 0 && (
						<InventoryPagination
							currentPage={currentPage}
							totalPages={totalPages}
							totalItems={totalItems}
							itemsPerPage={itemsPerPage}
							onPageChange={setCurrentPage}
							onItemsPerPageChange={(limit) => {
								setItemsPerPage(limit);
								setCurrentPage(1);
							}}
						/>
					)}
				</div>
			</div>

			<ProductSheet
				open={!!editingProduct}
				onOpenChange={(open) => !open && setEditingProduct(null)}
				product={editingProduct}
			/>

			<ProductDetailsSheet
				open={!!viewingProduct}
				onOpenChange={(open) => !open && setViewingProduct(null)}
				product={viewingProduct}
			/>

			<ChangeCategoryDialog
				open={!!categoryProduct}
				onOpenChange={(open) => !open && setCategoryProduct(null)}
				product={categoryProduct}
				onSave={async (id, cat) => {
					// This is now handled inside ChangeCategoryDialog, but we keep the prop for interface compatibility if needed, 
					// or we can remove it from the component definition if we fully refactored it. 
					// For now, let's just log or do nothing since the dialog handles the mutation.
					console.log("Category updated");
				}}
			/>

			<Dialog
				open={!!productToDelete}
				onOpenChange={(open: boolean) => !open && setProductToDelete(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Are you absolute sure?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete the
							product and remove your data from our servers.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setProductToDelete(null)} disabled={deleteProduct.isPending}>
							Cancel
						</Button>
						<Button
							onClick={(e: React.MouseEvent) => {
								e.preventDefault();
								confirmDelete();
							}}
							disabled={deleteProduct.isPending}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							{deleteProduct.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<BarcodeDialog
				open={isBarcodeDialogOpen}
				onOpenChange={setIsBarcodeDialogOpen}
				products={selectedProducts}
			/>
		</div>
	);
}
