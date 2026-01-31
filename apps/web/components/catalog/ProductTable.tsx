"use client";

import { Card } from "@kosh/ui/components/card";
import { Input } from "@kosh/ui/components/input";
import { Button } from "@kosh/ui/components/button";
import {
	MoreVertical,
	Plus,
	Download,
	Filter,
	Eye,
	EyeOff,
} from "lucide-react";
import { Checkbox } from "@kosh/ui/components/checkbox";

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
	return (
		<Card className="border border-border p-0 overflow-hidden">
			<div className="flex items-center justify-between p-6 border-b border-border">
				<div className="flex items-center gap-2">
					<h2 className="text-xl font-bold mb-6">Product Management</h2>
				</div>

				<div className="flex items-center gap-3">
					<Input
						type="text"
						placeholder="Search"
						className="px-3 py-2 border border-input rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
					/>
					<Button
						variant="outline"
						size="sm"
						className="gap-2 bg-transparent flex"
					>
						<Filter className="w-4 h-4" />
						Filter
					</Button>
					<Button
						size="sm"
						className="gap-2 bg-blue-600 hover:bg-blue-700 text-white flex"
					>
						<Download className="w-4 h-4" />
						<span>Import Barcode</span>
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border">
							<th className="text-left px-6 py-3">
								<Checkbox />
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Product ID
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Name Product
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Category
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Stock
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Barcode
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Status
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Actions
							</th>
						</tr>
					</thead>
					<tbody>
						{products.map((product, i) => (
							<tr
								key={product.id}
								className={`border-b border-border ${i === 4 ? "bg-blue-50/30 dark:bg-blue-950/10" : ""}`}
							>
								<td className="px-6 py-4">
									<Checkbox />
								</td>
								<td className="px-6 py-4 font-medium">{product.sku}</td>
								<td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">
									{product.name}
								</td>
								<td className="px-6 py-4">{product.category}</td>
								<td className="px-6 py-4">{product.stock}</td>
								<td className="px-6 py-4 font-mono text-xs">
									{product.barcode}
								</td>
								<td className="px-6 py-4">
									<span
										className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusStyles[product.status]}`}
									>
										{product.status}
									</span>
								</td>
								<td className="px-6 py-4">
									<Button
										variant="ghost"
										size="icon"
										className="w-6 h-6"
									>
										<MoreVertical className="w-4 h-4" />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between p-6 border-t border-border">
				<div className="text-sm text-muted-foreground">
					Show{" "}
					<select className="mx-2 px-2 py-1 border border-input rounded bg-background text-sm">
						<option>12</option>
						<option>24</option>
						<option>50</option>
					</select>
					per page
				</div>
				<div className="text-sm text-muted-foreground">1-10 of 52</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
					>
						←
					</Button>
					<div className="flex items-center gap-1">
						{[1, 2, 3, 4, 5].map((page) => (
							<Button
								key={page}
								variant={page === 2 ? "default" : "outline"}
								size="sm"
								className="w-8 h-8"
							>
								{page}
							</Button>
						))}
					</div>
					<Button
						variant="outline"
						size="sm"
					>
						→
					</Button>
				</div>
			</div>
		</Card>
	);
}
