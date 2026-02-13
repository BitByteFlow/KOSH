"use client";

import { useState, useMemo } from "react";
import { InventorySearch } from "@/modules/inventory/components/InventorySearch";
import InventoryItem from "@/modules/inventory/components/InventoryItem";
import { InventoryPagination } from "@/modules/inventory/components/InventoryPagination";
import { ProductSheet } from "@/modules/inventory/components/ProductSheet";
import { ProductDetailsSheet } from "@/modules/inventory/components/ProductDetailsSheet";
import { ChangeCategoryDialog } from "@/modules/inventory/components/ChangeCategoryDialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { useProductList } from "@/modules/inventory/hooks/useProducts";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { TransactionTableSkeleton } from "@/components/TableSkeleton";

export default function InventoryPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearch = useDebounce(searchQuery, 500);

	const [editingProduct, setEditingProduct] = useState<any>(null);
	const [viewingProduct, setViewingProduct] = useState<any>(null);
	const [categoryProduct, setCategoryProduct] = useState<any>(null);

	const { data: inventoryData, isLoading, isError } = useProductList({
		page: currentPage,
		limit: itemsPerPage,
		search: debouncedSearch,
	});

	const products = inventoryData?.data || [];
	const meta = inventoryData?.meta;
	const totalPages = meta?.totalPages || 0;
	const totalItems = meta?.total || 0;

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
		console.log("Deleting product:", id);
		// Implement actual delete logic here
	};

	return (
		<div className="flex-1 flex flex-col h-screen bg-background">
			<div className="border-b border-border px-8 py-6 flex items-center justify-between sticky top-0 bg-background">
				<div className="flex items-center gap-4"></div>
			</div>

			<div className="flex-1 overflow-auto px-8 py-6">
				<div className="space-y-6">
					<InventorySearch
						onSearch={setSearchQuery}
						onCategoryFilter={() => console.log("Category filter")}
						onStatusFilter={() => console.log("Status filter")}
						onExport={() => console.log("Export")}
					/>
					{isLoading ? <TransactionTableSkeleton /> :
						<div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
							<Table>
								<TableHeader className="bg-gray-50">
									<TableRow className="border-border">
										<TableHead className="w-12">
											<input
												type="checkbox"
												className="w-4 h-4 rounded border-gray-300"
											/>
										</TableHead>
										<TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Product Name
										</TableHead>
										<TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Category
										</TableHead>
										<TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Total Stock
										</TableHead>
										<TableHead className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Status
										</TableHead>
										<TableHead className="text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Actions
										</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody>
									{products.map((product) => (
										<InventoryItem
											key={product.id}
											{...product}
											onEdit={handleEditProduct}
											onViewDetails={handleViewDetails}
											onChangeCategory={handleChangeCategory}
											onDelete={handleDeleteProduct}
											onEditVariant={(id) => console.log("Edit variant:", id)}
										/>
									))}
									{products.length === 0 && (
										<TableRow>
											<TableCell colSpan={6} className="h-24 text-center">
												No products found.
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					}

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
					console.log("Saving category:", id, cat);
					await new Promise(resolve => setTimeout(resolve, 500));
				}}
			/>
		</div>
	);
}
