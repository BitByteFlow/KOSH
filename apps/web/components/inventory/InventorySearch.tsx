import { Search, Download, ChevronDown, Plus } from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { ProductSheet } from "./ProductSheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@kosh/ui/components/tooltip";

interface InventorySearchProps {
	onSearch?: (query: string) => void;
	onCategoryFilter?: () => void;
	onStatusFilter?: () => void;
	onExport?: () => void;
}

export function InventorySearch({
	onSearch,
	onCategoryFilter,
	onStatusFilter,
	onExport,
}: InventorySearchProps) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						id="inventory-search"
						type="text"
						placeholder="Search by name, SKU, or category..."
						onChange={(e) => onSearch?.(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>

				<ProductSheet
					trigger={
						<Button className="flex items-center gap-2 px-2">
							<Plus className="w-4 h-4" />
							<span className="text-white">Add Product</span>
						</Button>
					}
				/>
				<Button
					variant="outline"
					size="sm"
					onClick={onCategoryFilter}
					className="flex items-center gap-2 bg-transparent"
				>
					Category
					<ChevronDown className="w-4 h-4" />
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={onStatusFilter}
					className="flex items-center gap-2 bg-transparent"
				>
					Status
					<ChevronDown className="w-4 h-4" />
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={onExport}
					className="flex items-center gap-2 bg-transparent"
				>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-2 justify-center">
								<Download className="w-4 h-4" />
								Import Barcode
							</div>
						</TooltipTrigger>
						<TooltipContent>
							Select products for barcode
						</TooltipContent>
					</Tooltip>
				</Button>
			</div>
		</div>
	);
}
