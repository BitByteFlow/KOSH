import { Search, Download, ChevronDown } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

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
						type="text"
						placeholder="Search by name, SKU, or category..."
						onChange={(e) => onSearch?.(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
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
					<Download className="w-4 h-4" />
					Export
				</Button>
			</div>
		</div>
	);
}
