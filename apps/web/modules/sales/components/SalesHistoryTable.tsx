"use client";

import { useState, useMemo } from "react";
import {
	Search,
	SlidersHorizontal,
	Upload,
	Eye,
	MoreHorizontal,
	X,
	Printer,
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
import { Label } from "@kosh/ui/components/label";
import { Checkbox } from "@kosh/ui/components/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@kosh/ui/components/dropdown-menu";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { TransactionTableSkeleton } from "@/components/TableSkeleton";
import { gql } from "@/gql";
import { useQuery } from "@apollo/client/react";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";

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
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filters, setFilters] = useState({
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
				sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sale.paymentType.toLowerCase().includes(searchQuery.toLowerCase());

			if (!matchesSearch) return false;

			const total = sale.total;
			if (filters.minTotal && total < parseFloat(filters.minTotal)) return false;
			if (filters.maxTotal && total > parseFloat(filters.maxTotal)) return false;

			const profit = sale.profit;
			if (filters.minProfit && profit < parseFloat(filters.minProfit)) return false;
			if (filters.maxProfit && profit > parseFloat(filters.maxProfit)) return false;

			const itemCount = sale.items.length;
			if (filters.minItems && itemCount < parseInt(filters.minItems)) return false;
			if (filters.maxItems && itemCount > parseInt(filters.maxItems)) return false;

			if (
				filters.paymentTypes.length > 0 &&
				!filters.paymentTypes.includes(sale.paymentType)
			) {
				return false;
			}

			return true;
		});
	}, [salesData, searchQuery, filters]);

	const handlePaymentTypeChange = (type: string, checked: boolean) => {
		setFilters((prev) => ({
			...prev,
			paymentTypes: checked
				? [...prev.paymentTypes, type]
				: prev.paymentTypes.filter((t) => t !== type),
		}));
	};

	const resetFilters = () => {
		setFilters({
			minTotal: "",
			maxTotal: "",
			minProfit: "",
			maxProfit: "",
			minItems: "",
			maxItems: "",
			paymentTypes: [],
		});
	};

	const activeFiltersCount = useMemo(() => {
		let count = 0;
		if (filters.minTotal || filters.maxTotal) count++;
		if (filters.minProfit || filters.maxProfit) count++;
		if (filters.minItems || filters.maxItems) count++;
		if (filters.paymentTypes.length > 0) count++;
		return count;
	}, [filters]);

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
						className="flex items-center gap-2 h-10 relative"
						onClick={() => setIsFilterOpen(true)}
					>
						<SlidersHorizontal className="h-4 w-4" />
						Filter
						{activeFiltersCount > 0 && (
							<Badge
								variant="default"
								className="ml-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-blue-600"
							>
								{activeFiltersCount}
							</Badge>
						)}
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

			<div className="rounded-lg border-border bg-card text-card-foreground shadow-sm overflow-hidden">
				<Table className="border-border">
					<TableHeader className="bg-muted/50">
						<TableRow className="border-border">
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
									className="hover:bg-muted/50 border-border"
								>
									<TableCell className="font-medium text-xs truncate max-w-[120px] py-6">
										#{sale.id.slice(0, 8)}
									</TableCell>
									<TableCell className="text-muted-foreground text-xs">
										{format(new Date(sale.createdAt), "MMM dd, yyyy HH:mm")}
									</TableCell>
									<TableCell className="text-center text-xs">
										{sale.items.length}
									</TableCell>
									<TableCell>
										<Badge
											variant="secondary"
											className="font-normal text-[10px] px-2 py-0"
										>
											{sale.paymentType}
										</Badge>
									</TableCell>
									<TableCell className="text-right font-medium text-sm">
										{formatCurrency(sale.total)}
									</TableCell>
									<TableCell className="text-right font-medium text-green-600 text-sm">
										{formatCurrency(sale.profit)}
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

			<Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<SlidersHorizontal className="h-5 w-5" />
							Filter Sales
						</DialogTitle>
						<DialogDescription>
							Refine your sales history by applying filters below.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						{/* Total Filter */}
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Total Amount (Rs)
							</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label className="text-[10px] text-muted-foreground">Min</Label>
									<Input
										type="number"
										placeholder="0"
										className="h-9"
										value={filters.minTotal}
										onChange={(e) =>
											setFilters((prev) => ({ ...prev, minTotal: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-[10px] text-muted-foreground">Max</Label>
									<Input
										type="number"
										placeholder="Max"
										className="h-9"
										value={filters.maxTotal}
										onChange={(e) =>
											setFilters((prev) => ({ ...prev, maxTotal: e.target.value }))
										}
									/>
								</div>
							</div>
						</div>

						{/* Profit Filter */}
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Profit (Rs)
							</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label className="text-[10px] text-muted-foreground">Min</Label>
									<Input
										type="number"
										placeholder="0"
										className="h-9"
										value={filters.minProfit}
										onChange={(e) =>
											setFilters((prev) => ({ ...prev, minProfit: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-[10px] text-muted-foreground">Max</Label>
									<Input
										type="number"
										placeholder="Max"
										className="h-9"
										value={filters.maxProfit}
										onChange={(e) =>
											setFilters((prev) => ({ ...prev, maxProfit: e.target.value }))
										}
									/>
								</div>
							</div>
						</div>

						{/* Items Filter */}
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Number of Items
							</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<Label className="text-[10px] text-muted-foreground">Min</Label>
									<Input
										type="number"
										placeholder="0"
										className="h-9"
										value={filters.minItems}
										onChange={(e) =>
											setFilters((prev) => ({ ...prev, minItems: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-1">
									<Label className="text-[10px] text-muted-foreground">Max</Label>
									<Input
										type="number"
										placeholder="Max"
										className="h-9"
										value={filters.maxItems}
										onChange={(e) =>
											setFilters((prev) => ({ ...prev, maxItems: e.target.value }))
										}
									/>
								</div>
							</div>
						</div>

						{/* Payment Type Filter */}
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
								Payment Type
							</Label>
							<div className="flex flex-wrap gap-x-6 gap-y-2">
								{["CASH", "ONLINE", "CREDIT"].map((type) => (
									<div key={type} className="flex items-center space-x-2">
										<Checkbox
											id={`filter-payment-${type}`}
											checked={filters.paymentTypes.includes(type)}
											onCheckedChange={(checked) =>
												handlePaymentTypeChange(type, checked as boolean)
											}
										/>
										<Label
											htmlFor={`filter-payment-${type}`}
											className="text-sm font-medium cursor-pointer"
										>
											{type === "CREDIT" ? "Credit" : type.charAt(0) + type.slice(1).toLowerCase()}
										</Label>
									</div>
								))}
							</div>
						</div>
					</div>

					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="ghost"
							className="text-muted-foreground hover:text-foreground"
							onClick={resetFilters}
						>
							<X className="mr-2 h-4 w-4" />
							Reset Filters
						</Button>
						<Button onClick={() => setIsFilterOpen(false)} className="bg-blue-600 hover:bg-blue-700">
							Apply Filters
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
