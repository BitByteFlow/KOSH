"use client";

import { useState, useMemo } from "react";
import {
	Search,
	SlidersHorizontal,
	Upload,
	FileText,
	Printer,
	Eye,
	MoreHorizontal,
	Loader2,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { Badge } from "@kosh/ui/components/badge";
import { Button } from "@kosh/ui/components/button";
import { Input } from "@kosh/ui/components/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@kosh/ui/components/dropdown-menu";
import { useSalesList } from "../hooks/useSales";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { TransactionTableSkeleton } from "@/components/TableSkeleton";

export function SalesHistoryTable() {
	const [searchQuery, setSearchQuery] = useState("");
	const { data: sales, isLoading, error } = useSalesList();

	const filteredSales = useMemo(() => {
		if (!sales) return [];
		return sales.filter(
			(sale: any) =>
				sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sale.paymentType.toLowerCase().includes(searchQuery.toLowerCase()),
		);
	}, [sales, searchQuery]);

	if (isLoading) {
		return <TransactionTableSkeleton />;
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-12 text-destructive">
				Failed to load sales history.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search invoice or payment type..."
						className="pl-9 h-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						className="flex items-center gap-2 h-10"
					>
						<SlidersHorizontal className="h-4 w-4" />
						Filter
					</Button>
					<Button
						variant="outline"
						className="flex items-center gap-2 h-10"
					>
						<Upload className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
				<Table>
					<TableHeader className="bg-muted/50">
						<TableRow>
							<TableHead className="w-[120px]">Invoice</TableHead>
							<TableHead>Date</TableHead>
							<TableHead className="text-center">Items</TableHead>
							<TableHead>Payment</TableHead>
							<TableHead className="text-right">Total</TableHead>
							<TableHead className="text-right">Profit</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredSales.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="text-center py-12 text-muted-foreground"
								>
									No sales found.
								</TableCell>
							</TableRow>
						) : (
							filteredSales.map((sale: any) => (
								<TableRow
									key={sale.id}
									className="hover:bg-muted/50"
								>
									<TableCell className="font-medium text-xs truncate max-w-[120px]">
										#{sale.id.slice(0, 8)}
									</TableCell>
									<TableCell className="text-muted-foreground text-xs">
										{format(new Date(sale.createdAt), "MMM dd, yyyy HH:mm")}
									</TableCell>
									<TableCell className="text-center">
										{sale.items.length}
									</TableCell>
									<TableCell>
										<Badge
											variant="secondary"
											className="font-normal"
										>
											{sale.paymentType}
										</Badge>
									</TableCell>
									<TableCell className="text-right font-medium">
										{formatCurrency(parseFloat(sale.total))}
									</TableCell>
									<TableCell className="text-right font-medium text-green-600">
										{formatCurrency(parseFloat(sale.profit))}
									</TableCell>
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant="ghost"
													className="h-8 w-8 p-0"
												>
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuItem>
													<Eye className="mr-2 h-4 w-4" />
													View Details
												</DropdownMenuItem>
												<DropdownMenuItem>
													<Printer className="mr-2 h-4 w-4" />
													Print Invoice
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
