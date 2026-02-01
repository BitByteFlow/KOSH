"use client";

import { useState } from "react";
import { Card } from "@kosh/ui/components/card";
import { Input } from "@kosh/ui/components/input";
import { Button } from "@kosh/ui/components/button";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { MoreVertical, Filter, Download } from "lucide-react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@kosh/ui/components/tooltip";

import { TablePagination } from "@/components/Pagination";

interface Product {
	id: string;
	sku: string;
	name: string;
	category: string;
	stock: number;
	barcode: string;
	status: "Active" | "Pre-Order" | "Out of Stock";
}

interface ProductTableProps {
	products: Product[];
}

const statusStyles = {
	Active: "text-green-600 bg-green-50 dark:bg-green-950/20",
	"Pre-Order": "text-orange-600 bg-orange-50 dark:bg-orange-950/20",
	"Out of Stock": "text-red-600 bg-red-50 dark:bg-red-950/20",
};

export function ProductTable({ products }: ProductTableProps) {
	const [page, setPage] = useState(1);
	const pageSize = 10;

	const start = (page - 1) * pageSize;
	const end = start + pageSize;
	const paginatedProducts = products.slice(start, end);

	return (
		<Card className="border border-border p-0 px-6 overflow-hidden rounded-lg shadow-md">
			<div className="flex items-center justify-between py-6 border-b border-border">
				<h2 className="text-xl font-bold">Product Catalog</h2>

				<div className="flex items-center gap-3">
					<Input
						placeholder="Search"
						className="w-56"
					/>

					<Button
						variant="outline"
						size="sm"
						className="gap-2"
					>
						<Filter className="w-4 h-4" />
						Filter
					</Button>

					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								size="sm"
								className="gap-2 bg-blue-600 text-white hover:cursor-pointer"
							>
								<Download className="w-4 h-4" />
								Import Barcode
							</Button>
						</TooltipTrigger>
						<TooltipContent className="py-2">
							Select products for barcode
						</TooltipContent>
					</Tooltip>
				</div>
			</div>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader className="bg-gray-100">
						<TableRow className="border-border">
							<TableHead className="w-12">
								<Input
									type="checkbox"
									className="w-4 h-4"
								/>
							</TableHead>
							<TableHead>Product ID</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Price</TableHead>
							<TableHead>Variants</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>

					<TableBody className="[&_td]:py-6">
						{paginatedProducts.map((product) => (
							<TableRow
								key={product.id}
								className="border-border"
							>
								<TableCell>
									<Input
										type="checkbox"
										className="w-4 h-4"
									/>
								</TableCell>
								<TableCell className="font-medium">{product.sku}</TableCell>
								<TableCell className="text-blue-600 hover:underline cursor-pointer">
									{product.name}
								</TableCell>
								<TableCell>{product.category}</TableCell>
								<TableCell>{product.stock}</TableCell>
								<TableCell className="font-mono text-xs">
									{product.barcode}
								</TableCell>
								<TableCell>
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[product.status]}`}
									>
										{product.status}
									</span>
								</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="icon"
									>
										<MoreVertical className="w-4 h-4" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<TablePagination
				page={page}
				totalPages={Math.ceil(products.length / pageSize)}
				onPageChange={setPage}
				from={start + 1}
				to={Math.min(end, products.length)}
				total={products.length}
			/>
		</Card>
	);
}
