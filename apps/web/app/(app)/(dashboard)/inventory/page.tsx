"use client";

import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import InventoryItem from "@/components/inventory/InventoryItem";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
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

	const totalPages = Math.ceil(mockProducts.length / itemsPerPage);
	const visibleProducts = mockProducts.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

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
										onEdit={(id) => console.log("Edit product:", id)}
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
		</div>
	);
}
