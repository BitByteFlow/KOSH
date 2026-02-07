"use client";

import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { InventorySearch } from "@/modules/inventory/InventorySearch";
import InventoryItem from "@/modules/inventory/components/InventoryItem";
import { InventoryPagination } from "@/modules/inventory/components/InventoryPagination";
import { ProductSheet } from "@/modules/inventory/components/ProductSheet";
import { ProductDetailsSheet } from "@/modules/inventory/components/ProductDetailsSheet";
import { ChangeCategoryDialog } from "@/modules/inventory/components/ChangeCategoryDialog";
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { mockProducts } from "@/data/mockData";

export default function InventoryPage() {
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage, setItemsPerPage] = useState(10);

	// Action States
	const [editingProduct, setEditingProduct] = useState<any>(null);
	const [viewingProduct, setViewingProduct] = useState<any>(null);
	const [categoryProduct, setCategoryProduct] = useState<any>(null);

	const totalPages = Math.ceil(mockProducts.length / itemsPerPage);
	const visibleProducts = mockProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const handleEditProduct = (id: string) => {
		const product = mockProducts.find((p) => p.id === id);
		if (product) setEditingProduct(product);
	};

	const handleViewDetails = (id: string) => {
		const product = mockProducts.find((p) => p.id === id);
		if (product) setViewingProduct(product);
	};

	const handleChangeCategory = (id: string) => {
		const product = mockProducts.find((p) => p.id === id);
		if (product) setCategoryProduct(product);
	};

	const handleDeleteProduct = (id: string) => {
		console.log("Deleting product:", id);
		// Implement actual delete logic here
	};

	const handleDuplicateProduct = (id: string) => {
		console.log("Duplicating product:", id);
		// Implement duplicate logic here
	};

	return (
		<div className="flex-1 flex flex-col h-screen bg-background">
			<div className="border-b border-border px-8 py-6 flex items-center justify-between sticky top-0 bg-background">
				<div className="flex items-center gap-4"></div>
			</div>

			<div className="flex-1 overflow-auto px-8 py-6">
				<div className="space-y-6">
					<InventorySearch
						onSearch={(query) => console.log("Search:", query)}
						onCategoryFilter={() => console.log("Category filter")}
						onStatusFilter={() => console.log("Status filter")}
						onExport={() => console.log("Export")}
					/>
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
								{visibleProducts.map((product) => (
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
							</TableBody>
						</Table>
					</div>

					<InventoryPagination
						currentPage={currentPage}
						totalPages={totalPages}
						totalItems={mockProducts.length}
						itemsPerPage={itemsPerPage}
						onPageChange={setCurrentPage}
						onItemsPerPageChange={setItemsPerPage}
					/>
				</div>
			</div>

			{/* Edit Product Sheet */}
			<ProductSheet
				open={!!editingProduct}
				onOpenChange={(open) => !open && setEditingProduct(null)}
				product={editingProduct}
			/>

			{/* View Details Sheet */}
			<ProductDetailsSheet
				open={!!viewingProduct}
				onOpenChange={(open) => !open && setViewingProduct(null)}
				product={viewingProduct}
			/>

			{/* Change Category Dialog */}
			<ChangeCategoryDialog
				open={!!categoryProduct}
				onOpenChange={(open) => !open && setCategoryProduct(null)}
				product={categoryProduct}
				onSave={async (id, cat) => {
					console.log("Saving category:", id, cat);
					// Simulate API call
					await new Promise(resolve => setTimeout(resolve, 500));
				}}
			/>
		</div>
	);
}
