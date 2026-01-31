import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@kosh/ui/components/button";

interface InventoryPaginationProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
	onPageChange?: (page: number) => void;
	onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export function InventoryPagination({
	currentPage,
	totalPages,
	totalItems,
	itemsPerPage,
	onPageChange,
	onItemsPerPageChange,
}: InventoryPaginationProps) {
	const startItem = (currentPage - 1) * itemsPerPage + 1;
	const endItem = Math.min(currentPage * itemsPerPage, totalItems);

	return (
		<div className="flex items-center justify-between py-4 border-t border-gray-200">
			<div className="flex items-center gap-4">
				<span className="text-sm text-gray-600">
					Showing {startItem}-{endItem} of {totalItems} products
				</span>
				<div className="flex items-center gap-2">
					<span className="text-sm text-gray-600">Show</span>
					<select
						value={itemsPerPage}
						onChange={(e) => onItemsPerPageChange?.(Number(e.target.value))}
						className="px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					>
						<option value={10}>10</option>
						<option value={25}>25</option>
						<option value={50}>50</option>
					</select>
					<span className="text-sm text-gray-600">per page</span>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange?.(currentPage - 1)}
					disabled={currentPage === 1}
					className="gap-1"
				>
					<ChevronLeft className="w-4 h-4" />
					Previous
				</Button>

				<div className="flex items-center gap-1">
					{Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
						const page = i + 1;
						const isActive = page === currentPage;

						return (
							<Button
								key={page}
								variant={isActive ? "default" : "outline"}
								size="sm"
								onClick={() => onPageChange?.(page)}
								className="w-8 h-8 p-0"
							>
								{page}
							</Button>
						);
					})}
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => onPageChange?.(currentPage + 1)}
					disabled={currentPage === totalPages}
					className="gap-1"
				>
					Next
					<ChevronRight className="w-4 h-4" />
				</Button>
			</div>
		</div>
	);
}
