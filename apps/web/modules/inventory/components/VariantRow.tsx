import { Edit } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { TableRow, TableCell } from "@kosh/ui/components/table";
import { ProductVariant } from "@/gql/graphql";
import { cn } from "@/lib/utils";

interface VariantRowProps {
	variant: any; // Using any or a partial type because the query returns a subset of ProductVariant
	onEdit?: (variantId: string) => void;
}

export function VariantRow({ variant, onEdit }: VariantRowProps) {
	return (
		<TableRow className="border-none hover:bg-muted/40 transition-colors">
			<TableCell className="w-12 pl-6" />
			<TableCell>
				<div className="flex flex-wrap gap-x-4 gap-y-1">
					{variant.attributes?.map((attr: any, index: number) => (
						<div
							key={index}
							className="text-sm"
						>
							<span className="text-muted-foreground font-medium">{attr.name}: </span>
							<span className="font-semibold text-foreground">{attr.value}</span>
						</div>
					))}
				</div>
			</TableCell>
			<TableCell>
				<div className="text-xs space-y-0.5">
					<div className="font-mono text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded">SKU: {variant.sku || "N/A"}</div>
					<div className="text-muted-foreground flex items-center gap-1.5 opacity-80">
						<span className="uppercase text-[10px] font-bold tracking-tighter">Barcode</span>
						<span>{variant.barcode || "N/A"}</span>
					</div>
				</div>
			</TableCell>
			<TableCell className="font-bold tabular-nums text-foreground">
				Rs. {variant.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
			</TableCell>
			<TableCell>
				<div className="flex items-center gap-2">
					<div className={cn(
						"h-2 w-2 rounded-full shadow-sm",
						variant.lowStock ? "bg-destructive animate-pulse" : "bg-success"
					)} />
					<span
						className={cn(
							"font-bold text-sm",
							variant.lowStock ? "text-destructive" : "text-foreground"
						)}
					>
						{variant.stock} <span className="text-xs font-medium text-muted-foreground capitalize">In Stock</span>
					</span>
				</div>
			</TableCell>
			<TableCell className="text-right pr-6">
				<Button
					variant="ghost"
					size="sm"
					className="h-8 px-2 hover:bg-accent text-muted-foreground hover:text-foreground"
					onClick={() => onEdit?.(variant.id)}
				>
					<Edit className="w-4 h-4 mr-1.5" />
					Edit
				</Button>
			</TableCell>
		</TableRow>
	);
}
