import { Edit } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { TableRow, TableCell } from "@kosh/ui/components/table";
import { ProductVariant } from "@/services/products.service";

interface VariantRowProps {
	variant: ProductVariant;
	onEdit?: (variantId: string) => void;
}

export function VariantRow({ variant, onEdit }: VariantRowProps) {
	return (
		<TableRow className="border-none hover:bg-muted/40">
			<TableCell className="w-12 pl-6" />
			<TableCell>
				<div className="flex flex-wrap gap-x-4 gap-y-1">
					{variant.attributes.map((attr, index) => (
						<div
							key={index}
							className="text-sm"
						>
							<span className="text-muted-foreground">{attr.name}: </span>
							<span className="font-medium">{attr.value}</span>
						</div>
					))}
				</div>
			</TableCell>
			<TableCell>
				<div className="text-sm text-muted-foreground">
					<div className="font-mono text-xs">{variant.sku || "N/A"}</div>
					<div className="text-xs mt-1">{variant.barcode || "N/A"}</div>
				</div>
			</TableCell>
			<TableCell className="font-medium">
				Rs. {variant.price.toFixed(2)}
			</TableCell>
			<TableCell>
				<div className="flex items-center gap-2">
					{variant.lowStock && (
						<span className="relative flex h-2 w-2">
							<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
							<span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
						</span>
					)}
					<span
						className={`font-medium ${variant.lowStock ? "text-orange-500" : ""
							}`}
					>
						{variant.stock} in stock
					</span>
				</div>
			</TableCell>
			<TableCell className="text-right pr-6">
				<Button
					variant="ghost"
					size="sm"
					onClick={() => onEdit?.(variant.id)}
				>
					<Edit className="w-4 h-4 mr-2" />
					Edit
				</Button>
			</TableCell>
		</TableRow>
	);
}
