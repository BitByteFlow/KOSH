"use client";

import { useState } from "react";
import { ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { StatusBadge } from "./StatusBadge";
import { VariantRow } from "./VariantRow";

interface Variant {
	id: string;
	sku: string;
	barcode: string;
	attributes: Record<string, string>;
	price: number;
	stock: number;
	lowStock?: boolean;
}

interface InventoryItemProps {
	id: string;
	productName: string;
	category: string;
	totalStock: number;
	variantCount: number;
	status: "active" | "inactive" | "out-of-stock";
	variants: Variant[];
	onEdit?: (productId: string) => void;
	onEditVariant?: (variantId: string) => void;
}

export function InventoryItem({
	id,
	productName,
	category,
	totalStock,
	variantCount,
	status,
	variants,
	onEdit,
	onEditVariant,
}: InventoryItemProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const getStatusBadge = () => {
		const statusConfig = {
			active: { label: "Active", status: "active" as const },
			inactive: { label: "Inactive", status: "inactive" as const },
			"out-of-stock": {
				label: "Out of Stock",
				status: "out-of-stock" as const,
			},
		};
		return statusConfig[status];
	};

	const statusConfig = getStatusBadge();

	return (
		<>
			<tr className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
				<td className="px-6 py-4">
					<input
						type="checkbox"
						className="w-4 h-4 rounded border-gray-300"
					/>
				</td>
				<td className="px-6 py-4">
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-2 text-left hover:text-blue-600 transition-colors"
					>
						<ChevronDown
							className={`w-5 h-5 transition-transform duration-200 ${
								isExpanded ? "rotate-180" : ""
							}`}
						/>
						<div>
							<h3 className="font-medium text-gray-900">{productName}</h3>
							<p className="text-sm text-gray-500">{variantCount} Variants</p>
						</div>
					</button>
				</td>
				<td className="px-6 py-4">
					<span className="text-sm text-gray-600">{category}</span>
				</td>
				<td className="px-6 py-4">
					<span className="text-sm font-medium text-gray-900">
						{totalStock}
					</span>
				</td>
				<td className="px-6 py-4">
					<StatusBadge status={status}>{statusConfig.label}</StatusBadge>
				</td>
				<td className="px-6 py-4 text-right">
					<Button
						variant="ghost"
						size="sm"
						className="p-0 w-8 h-8 hover:bg-gray-100"
					>
						<MoreVertical className="w-4 h-4 text-gray-500" />
					</Button>
				</td>
			</tr>

			{isExpanded && (
				<>
					<tr className="bg-gray-50">
						<td
							colSpan={6}
							className="px-6 py-3"
						>
							<div className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex gap-12">
								<span>ATTRIBUTES</span>
								<span className="ml-20">SKU / BARCODE</span>
								<span className="ml-20">PRICE</span>
								<span className="ml-20">STOCK</span>
								<span className="ml-32">ACTION</span>
							</div>
						</td>
					</tr>
					{variants.map((variant) => (
						<VariantRow
							key={variant.id}
							variant={variant}
							onEdit={onEditVariant}
						/>
					))}
				</>
			)}
		</>
	);
}
