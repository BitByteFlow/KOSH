"use client";

import { useState } from "react";
import { ChevronDown, MoreVertical } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { Checkbox } from "@kosh/ui/components/checkbox";
import { StatusBadge } from "./StatusBadge";
import { VariantRow } from "./VariantRow";

import {
	TableRow,
	TableCell,
	Table,
	TableHeader,
	TableHead,
	TableBody,
} from "@kosh/ui/components/table";

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

const InventoryItem = ({
	id,
	productName,
	category,
	totalStock,
	variantCount,
	status,
	variants,
	onEdit,
	onEditVariant,
}: InventoryItemProps) => {
	const [isExpanded, setIsExpanded] = useState(false);

	const statusConfig = {
		active: "Active",
		inactive: "Inactive",
		"out-of-stock": "Out of Stock",
	}[status];

	return (
		<>
			<TableRow className="hover:bg-muted/50 transition-colors border-b-border [&_td:first-child]:pl-6 [&_td:last-child]:pr-6 [&_td]:py-5">
				<TableCell className="w-12">
					<Checkbox />
				</TableCell>

				<TableCell>
					<button
						onClick={() => setIsExpanded(!isExpanded)}
						className="flex items-center gap-3 text-left w-full"
					>
						<ChevronDown
							className={`w-4 h-4 transition-transform text-muted-foreground ${
								isExpanded ? "rotate-180" : ""
							}`}
						/>
						<div>
							<p className="font-medium">{productName}</p>
							<p className="text-sm text-muted-foreground">
								{variantCount} Variants
							</p>
						</div>
					</button>
				</TableCell>

				<TableCell className="text-sm text-muted-foreground">
					{category}
				</TableCell>

				<TableCell className="font-medium">{totalStock}</TableCell>

				<TableCell>
					<StatusBadge status={status}>{statusConfig}</StatusBadge>
				</TableCell>

				<TableCell className="text-right">
					<Button
						variant="ghost"
						size="icon"
						className="w-8 h-8"
					>
						<MoreVertical className="w-4 h-4 text-muted-foreground" />
					</Button>
				</TableCell>
			</TableRow>

			{isExpanded && (
				<TableRow className="border-none bg-transparent hover:bg-transparent">
					<TableCell
						colSpan={6}
						className="p-0"
					>
						<div className="p-4 bg-muted/20">
							<Table>
								<TableHeader>
									<TableRow className="border-border">
										<TableHead className="w-12 pl-6" />
										<TableHead>Attributes</TableHead>
										<TableHead>SKU / Barcode</TableHead>
										<TableHead>Price</TableHead>
										<TableHead>Stock</TableHead>
										<TableHead className="text-right pr-6">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{variants.map((variant) => (
										<VariantRow
											key={variant.id}
											variant={variant}
											onEdit={onEditVariant}
										/>
									))}
								</TableBody>
							</Table>
						</div>
					</TableCell>
				</TableRow>
			)}
		</>
	);
};

export default InventoryItem;
