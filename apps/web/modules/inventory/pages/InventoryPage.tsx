"use client";

import { useState, useMemo } from "react";
import InventorySearch from "@/modules/inventory/components/InventorySearch";
import InventoryItem from "@/modules/inventory/components/InventoryItem";
import { InventoryPagination } from "@/modules/inventory/components/InventoryPagination";
import { ProductSheet } from "@/modules/inventory/components/ProductSheet";
import { ProductDetailsSheet } from "@/modules/inventory/components/ProductDetailsSheet";
import {
	useProductList,
	useDeleteProduct,
	useUpdateVariant
} from "../hooks/useProducts";
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
import { useDebounce } from "@/hooks/useDebounce";
import { TransactionTableSkeleton } from "@/components/TableSkeleton";
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
import { ProductVariant, Status } from "@/gql/graphql";
import { Product } from "@/gql/graphql";



const DEFAULT_INVENTORY_DATA = {
	data: [],
	meta: {
		page: 1,
		limit: 10,
		total: 0,
		totalPages: 0,
		hasNext: false,
		hasPrev: false,
	}
};

const InventoryPage = () => {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 500);

	const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
	const [statusFilter, setStatusFilter] = useState<Status | null>(null);
	const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
	const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);

	const [editingProduct, setEditingProduct] = useState<Product | null>(null);
	const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
	const [categoryProduct, setCategoryProduct] = useState<Product | null>(null);


	const { data: rawData, loading, error, refetch } = useProductList({
		page: currentPage,
		limit: itemsPerPage,
		search: debouncedSearch,
		categoryId: categoryFilter || undefined,
		status: statusFilter || undefined
	});

	const [deleteProductMutation] = useDeleteProduct();
	const [updateProductVariantMutation] = useUpdateVariant();

	const [productToDelete, setProductToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const products = useMemo(() =>
		rawData?.listProductsWithFilter?.data ?? [],
		[rawData?.listProductsWithFilter?.data]
	);
	const meta = useMemo(() =>
		rawData?.listProductsWithFilter?.meta ?? DEFAULT_INVENTORY_DATA.meta,
		[rawData?.listProductsWithFilter?.meta]
	);

	const totalPages = meta.totalPages;
	const totalItems = meta.total;

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
				currentIds.forEach((id: string) => newSet.delete(id));
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
		if (product) setCategoryProduct(product as Product);
	};

	const handleDeleteProduct = (id: string) => {
		setProductToDelete(id);
	};

	const confirmDelete = async () => {
		if (productToDelete) {
			try {
				setIsDeleting(true);
				const { data } = await deleteProductMutation({
					variables: { productId: productToDelete }
				});
				if (data?.deleteProduct?.success) {
					toast.success("Product deleted successfully");
				} else {
					toast.error(data?.deleteProduct?.message || "Failed to delete product");
				}
				setProductToDelete(null);
			} catch (error) {
				toast.error("Failed to delete product");
			} finally {
				setIsDeleting(false);
			}
		}
	};

	return (
		<div className="flex-1 flex flex-col min-h-0 bg-background">
			<div className="border-b border-border px-4 md:px-8 py-6 flex items-center justify-between sticky top-0 bg-background z-10">
				<h1 className="text-2xl font-bold">Inventory</h1>
			</div>

			<div className="flex-1 overflow-auto px-4 md:px-8 py-6">
				<div className="space-y-6">
					<InventorySearch
						onSearch={setSearchQuery}
						onCategoryFilter={setCategoryFilter}
						onStatusFilter={(status) => setStatusFilter(status as Status | null)}
						onGenerateBarcodes={() => setIsBarcodeDialogOpen(true)}
						selectedCount={selectedProductIds.size}
						activeCategoryId={categoryFilter}
						activeStatus={statusFilter}
					/>
					{loading ? (
						<TransactionTableSkeleton />
					) : (
						<div className="bg-card rounded-xl border border-border overflow-x-auto shadow-sm">
							<Table>
								<TableHeader className="bg-muted/50">
									<TableRow className="border-border">
										<TableHead className="w-12 pl-6 text-center">
											<input
												type="checkbox"
												checked={isAllSelected}
												onChange={(e) => handleSelectAll(e.target.checked)}
												className="w-4 h-4 rounded border-border cursor-pointer accent-primary"
											/>
										</TableHead>
										<TableHead className="text-xs font-bold text-foreground uppercase tracking-wider h-12">
											Product Name
										</TableHead>
										<TableHead className="text-xs font-bold text-foreground uppercase tracking-wider h-12">
											Category
										</TableHead>
										<TableHead className="text-xs font-bold text-foreground uppercase tracking-wider h-12">
											Total Stock
										</TableHead>
										<TableHead className="text-xs font-bold text-foreground uppercase tracking-wider h-12">
											Status
										</TableHead>
										<TableHead className="text-right text-xs font-bold text-foreground uppercase tracking-wider h-12 pr-6">
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
											onUpdateVariant={async (variant: ProductVariant) => {
												try {
													const result = await updateProductVariantMutation({
														variables: {
															variantId: variant.id,
															input: {
																productId: product.id,
																costPrice: variant.costPrice,
																sellingPrice: variant.sellingPrice,
																stock: variant.stock,
																status: variant.status,
																attributes: variant.attributes?.map((attr: any) => ({
																	name: attr.name,
																	value: attr.value
																}))
															}
														}
													});
													if (result.data?.updateProductVariant.success) {
														toast.success("Variant updated successfully");
													}
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

					{!loading && products.length > 0 && (
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
						<Button variant="outline" onClick={() => setProductToDelete(null)} disabled={isDeleting}>
							Cancel
						</Button>
						<Button
							onClick={(e: React.MouseEvent) => {
								e.preventDefault();
								confirmDelete();
							}}
							disabled={isDeleting}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							{isDeleting ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<BarcodeDialog
				open={isBarcodeDialogOpen}
				onOpenChange={setIsBarcodeDialogOpen}
				products={selectedProducts as Product[]}
			/>
		</div>
	);
}

export default InventoryPage;