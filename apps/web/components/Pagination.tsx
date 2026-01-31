"use client";

import { Button } from "@kosh/ui/components/button";

interface PaginationProps {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	from: number;
	to: number;
	total: number;
}

export function TablePagination({
	page,
	totalPages,
	onPageChange,
	from,
	to,
	total,
}: PaginationProps) {
	return (
		<div className="flex items-center justify-between p-6 border-t border-border">
			<div className="text-sm text-muted-foreground">
				{from}-{to} of {total}
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={page === 1}
					onClick={() => onPageChange(page - 1)}
				>
					←
				</Button>

				<div className="flex items-center gap-1">
					{Array.from({ length: totalPages }).map((_, i) => {
						const p = i + 1;
						return (
							<Button
								key={p}
								variant={p === page ? "default" : "outline"}
								size="sm"
								className="w-8 h-8"
								onClick={() => onPageChange(p)}
							>
								{p}
							</Button>
						);
					})}
				</div>

				<Button
					variant="outline"
					size="sm"
					disabled={page === totalPages}
					onClick={() => onPageChange(page + 1)}
				>
					→
				</Button>
			</div>
		</div>
	);
}
