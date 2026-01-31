"use client";

import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { InventorySearch } from "@/components/inventory/InventorySearch";
import { InventoryItem } from "@/components/inventory/InventoryItem";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";

const mockProducts = [
	{
		id: "1",
		productName: "Cotton Crew Neck T-Shirt",
		category: "Apparel",
		totalStock: 57,
		variantCount: 2,
		status: "active" as const,
		variants: [
			{
				id: "v1",
				sku: "TS-WH-M",
				barcode: "898123456789",
				attributes: { Size: "M", Color: "White" },
				price: 25.0,
				stock: 45,
				lowStock: false,
			},
			{
				id: "v2",
				sku: "TS-WH-S",
				barcode: "898123456798",
				attributes: { Size: "S", Color: "White" },
				price: 25.0,
				stock: 12,
				lowStock: true,
			},
		],
	},
	{
		id: "2",
		productName: "Slim Fit Denim Jeans",
		category: "Bottoms",
		totalStock: 124,
		variantCount: 4,
		status: "active" as const,
		variants: [
			{
				id: "v3",
				sku: "JN-BL-30",
				barcode: "898123456800",
				attributes: { Size: "30", Color: "Blue" },
				price: 65.0,
				stock: 35,
				lowStock: false,
			},
			{
				id: "v4",
				sku: "JN-BL-32",
				barcode: "898123456811",
				attributes: { Size: "32", Color: "Blue" },
				price: 65.0,
				stock: 42,
				lowStock: false,
			},
			{
				id: "v5",
				sku: "JN-BK-30",
				barcode: "898123456822",
				attributes: { Size: "30", Color: "Black" },
				price: 65.0,
				stock: 28,
				lowStock: false,
			},
			{
				id: "v6",
				sku: "JN-BK-32",
				barcode: "898123456833",
				attributes: { Size: "32", Color: "Black" },
				price: 65.0,
				stock: 19,
				lowStock: true,
			},
		],
	},
	{
		id: "3",
		productName: "Classic Leather Belt",
		category: "Accessories",
		totalStock: 0,
		variantCount: 1,
		status: "out-of-stock" as const,
		variants: [
			{
				id: "v7",
				sku: "BL-LTH-BK",
				barcode: "898123456844",
				attributes: { Size: "One Size", Color: "Black" },
				price: 45.0,
				stock: 0,
				lowStock: true,
			},
		],
	},
	{
		id: "4",
		productName: "Summer Floral Shirt",
		category: "Apparel",
		totalStock: 0,
		variantCount: 3,
		status: "inactive" as const,
		variants: [
			{
				id: "v8",
				sku: "SF-FL-S",
				barcode: "898123456855",
				attributes: { Size: "S", Color: "Floral" },
				price: 35.0,
				stock: 0,
				lowStock: true,
			},
			{
				id: "v9",
				sku: "SF-FL-M",
				barcode: "898123456866",
				attributes: { Size: "M", Color: "Floral" },
				price: 35.0,
				stock: 0,
				lowStock: true,
			},
			{
				id: "v10",
				sku: "SF-FL-L",
				barcode: "898123456877",
				attributes: { Size: "L", Color: "Floral" },
				price: 35.0,
				stock: 0,
				lowStock: true,
			},
		],
	},
];

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
				<h1 className="text-3xl font-bold text-foreground">Inventory</h1>
				<div className="flex items-center gap-4">
					<Button
						variant="outline"
						size="icon"
						className="h-9 w-9 bg-transparent"
					>
						<Bell className="w-5 h-5" />
					</Button>
					<Button className="flex items-center gap-2 px-2">
						<Plus
							className="w-4 h-4"
							color="white"
						/>
						<span className="text-white">Add Product</span>
					</Button>
				</div>
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
						<table className="w-full">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="px-6 py-3 text-left">
										<input
											type="checkbox"
											className="w-4 h-4 rounded border-gray-300"
										/>
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Product Name
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Category
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Total Stock
									</th>
									<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Status
									</th>
									<th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{visibleProducts.map((product) => (
									<InventoryItem
										key={product.id}
										{...product}
										onEdit={(id) => console.log("Edit product:", id)}
										onEditVariant={(id) => console.log("Edit variant:", id)}
									/>
								))}
							</tbody>
						</table>
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
