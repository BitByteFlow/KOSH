"use client";

import { useState, useMemo } from "react";
import {
	Search,
	SlidersHorizontal,
	Upload,
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
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { TransactionTableSkeleton } from "@/components/TableSkeleton";
import { gql } from "@/gql";
import { useQuery } from "@apollo/client/react";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";
import SalesFilter, { SalesFilters } from "./SalesFilter";
import SalesExportDialog from "./SalesExportDialog";
import { useDebounce } from "@/hooks/useDebounce";

const PAYMENT_TYPE_CONFIG: Record<
	string,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
	}
> = {
	CASH: { label: "Cash", variant: "default" },
	ONLINE: { label: "Online", variant: "secondary" },
	CREDIT: { label: "Credit", variant: "destructive" },
};

const GET_SALES_HISTORY = gql(`
	query getSalesHistory{
		getSales {
			success
			message
			data {
				id
				total
				discount
				profit
				paymentType
				items {
					id
					quantity
					sellPrice
					costPrice
					variantId
				}
				createdAt
				updatedAt
				deletedAt
			}
		}
	}
`)

export function SalesHistoryTable() {
	const [searchQuery, setSearchQuery] = useState("");
	const debouncedSearchQuery = useDebounce(searchQuery, 500);
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [isExportOpen, setIsExportOpen] = useState(false);
	const [appliedFilters, setAppliedFilters] = useState<SalesFilters>({
		minTotal: "",
		maxTotal: "",
		minProfit: "",
		maxProfit: "",
		minItems: "",
		maxItems: "",
		paymentTypes: [] as string[],
	});

	const { data: rawData, loading, error } = useQuery(GET_SALES_HISTORY)

	const salesData = useMemo(() =>
		parseGraphQLListResponse(rawData?.getSales),
		[rawData?.getSales]
	);

	const filteredSales = useMemo(() => {
		return salesData.data?.filter((sale) => {
			const matchesSearch =
				sale.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
				sale.paymentType
					.toLowerCase()
					.includes(debouncedSearchQuery.toLowerCase());

			if (!matchesSearch) return false;

			const total = sale.total;
			if (appliedFilters.minTotal && total < parseFloat(appliedFilters.minTotal))
				return false;
			if (appliedFilters.maxTotal && total > parseFloat(appliedFilters.maxTotal))
				return false;

			const profit = sale.profit;
			if (
				appliedFilters.minProfit &&
				profit < parseFloat(appliedFilters.minProfit)
			)
				return false;
			if (
				appliedFilters.maxProfit &&
				profit > parseFloat(appliedFilters.maxProfit)
			)
				return false;

			const itemCount = sale.items.length;
			if (
				appliedFilters.minItems &&
				itemCount < parseInt(appliedFilters.minItems)
			)
				return false;
			if (
				appliedFilters.maxItems &&
				itemCount > parseInt(appliedFilters.maxItems)
			)
				return false;

			if (
				appliedFilters.paymentTypes.length > 0 &&
				!appliedFilters.paymentTypes.includes(sale.paymentType)
			) {
				return false;
			}

			return true;
		});
	}, [salesData, debouncedSearchQuery, appliedFilters]);


	const activeFiltersCount = useMemo(() => {
		let count = 0;
		if (appliedFilters.minTotal || appliedFilters.maxTotal) count++;
		if (appliedFilters.minProfit || appliedFilters.maxProfit) count++;
		if (appliedFilters.minItems || appliedFilters.maxItems) count++;
		if (appliedFilters.paymentTypes.length > 0) count++;
		return count;
	}, [appliedFilters]);

	if (loading) {
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
						className="flex items-center gap-2 h-10 relative hover:cursor-pointer"
						onClick={() => setIsFilterOpen(true)}
					>
						<SlidersHorizontal className="h-4 w-4" />
						Filter
						{activeFiltersCount > 0 && (
							<Badge
								variant="default"
								className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-primary text-primary-foreground"
							>
								{activeFiltersCount}
							</Badge>
						)}
					</Button>
					<Button
						variant="outline"
						className="flex items-center gap-2 h-10"
						onClick={() => setIsExportOpen(true)}
					>
						<Upload className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className=" rounded-xl border border-border bg-card text-card-foreground shadow-sm overflow-x-auto">
				<Table>
					<TableHeader className="bg-muted/50">
						<TableRow className="border-border">
							<TableHead className="w-30 text-base font-semibold text-foreground">Invoice</TableHead>
							<TableHead className="text-base font-semibold text-foreground">Date</TableHead>
							<TableHead className="text-center text-base font-semibold text-foreground">Items</TableHead>
							<TableHead className="text-base font-semibold text-foreground">Payment</TableHead>
							<TableHead className="text-right text-base font-semibold text-foreground">Total</TableHead>
							<TableHead className="text-right text-base font-semibold text-foreground">Profit</TableHead>
							<TableHead className="w-12.5"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredSales?.length === 0 ? (
							<TableRow className="border-border">
								<TableCell
									colSpan={7}
									className="text-center py-12 text-muted-foreground"
								>
									No sales found.
								</TableCell>
							</TableRow>
						) : (
							filteredSales?.map((sale) => (
								<TableRow
									key={sale.id}
									className="hover:bg-muted/30 border-border/50 transition-colors"
								>
									<TableCell className="font-medium text-xs truncate max-w-30 py-6">
										#{sale.id.slice(0, 8)}
									</TableCell>
									<TableCell className="text-muted-foreground text-xs">
										{format(new Date(sale.createdAt), "MMM dd, yyyy HH:mm")}
									</TableCell>
									<TableCell className="text-center text-xs">
										{sale.items.length}
									</TableCell>
									<TableCell>
										{(() => {
											const typeConfig = PAYMENT_TYPE_CONFIG[sale.paymentType] || {
												label: sale.paymentType,
												variant: "outline" as const,
											};
											return (
												<Badge
													variant={typeConfig.variant}
													className="font-semibold text-sm px-2 py-1"
												>
													{typeConfig.label}
												</Badge>
											);
										})()}
									</TableCell>
									<TableCell className="text-right font-medium text-sm">
										{formatCurrency(sale.total)}
									</TableCell>
									<TableCell className="text-right font-medium text-green-600 text-sm">
										{formatCurrency(sale.profit)}
									</TableCell>
									{/* <TableCell>
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
									</TableCell> */}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			<SalesFilter
				isOpen={isFilterOpen}
				onOpenChange={setIsFilterOpen}
				initialFilters={appliedFilters}
				onApply={setAppliedFilters}
			/>

			<SalesExportDialog
				isOpen={isExportOpen}
				onOpenChange={setIsExportOpen}
				salesData={filteredSales || []}
			/>
		</div>
	);
}
