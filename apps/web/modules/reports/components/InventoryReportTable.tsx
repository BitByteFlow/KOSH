import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@/gql";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { DateRangeSelector } from "@/modules/reports/components/DateRangeSelector";
import { Badge } from "@kosh/ui/components/badge";
import { Button } from "@kosh/ui/components/button";
import { Input } from "@kosh/ui/components/input";
import { Label } from "@kosh/ui/components/label";
import { Checkbox } from "@kosh/ui/components/checkbox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { cn } from "@/lib/utils";

interface InventoryReport {
	id: string;
	name: string;
	sku: string;
	category: string;
	stock: number;
	value: number;
	status: string;
}

const GET_INVENTORY_REPORT = gql(`
	query getInventoryReport ($filters: InventoryReportFilter!){
		getInventoryReport (filters: $filters) {
			success
			data {
				id
				name
				sku
				category
				stock
				value
				status
			}
			totalCount
		}
	}
`) as any;

export function InventoryReportTable() {
	const [dateRange, setDateRange] = useState("This Month");
	const [tempDateRange, setTempDateRange] = useState("This Month");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	// State for filters that are currently applied to the query
	const [appliedFilters, setAppliedFilters] = useState({
		categories: [] as string[],
		statuses: [] as string[],
		minStock: "",
		maxStock: "",
	});

	// State for filters currently being edited in the dialog
	const [tempFilters, setTempFilters] = useState({
		categories: [] as string[],
		statuses: [] as string[],
		minStock: "",
		maxStock: "",
	});

	// Debounce logic for search
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setCurrentPage(1); // Reset to first page on search
		}, 500);
		return () => clearTimeout(handler);
	}, [searchQuery]);

	const { data, loading } = useQuery<{ getInventoryReport: { items: InventoryReport[], totalCount: number } }>(GET_INVENTORY_REPORT, {
		variables: {
			filters: {
				categories: appliedFilters.categories.length > 0 ? appliedFilters.categories : undefined,
				statuses: appliedFilters.statuses.length > 0 ? appliedFilters.statuses : undefined,
				minStock: appliedFilters.minStock ? parseInt(appliedFilters.minStock) : undefined,
				maxStock: appliedFilters.maxStock ? parseInt(appliedFilters.maxStock) : undefined,
				searchQuery: debouncedSearch || undefined,
				skip: (currentPage - 1) * pageSize,
				take: pageSize,
			}
		}
	});

	const items = data?.getInventoryReport?.items || [];
	const totalCount = data?.getInventoryReport?.totalCount || 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	const handleCategoryChange = (category: string, checked: boolean) => {
		setTempFilters(prev => ({
			...prev,
			categories: checked
				? [...prev.categories, category]
				: prev.categories.filter(c => c !== category)
		}));
	};

	const handleStatusChange = (status: string, checked: boolean) => {
		setTempFilters(prev => ({
			...prev,
			statuses: checked
				? [...prev.statuses, status]
				: prev.statuses.filter(s => s !== status)
		}));
	};

	const handleApplyFilters = () => {
		if (!tempDateRange) return;
		setAppliedFilters(tempFilters);
		setDateRange(tempDateRange);
		setIsFilterOpen(false);
		setCurrentPage(1);
	};

	const handleResetFilters = () => {
		const defaultFilters = {
			categories: [],
			statuses: [],
			minStock: "",
			maxStock: "",
		};
		setTempFilters(defaultFilters);
		setAppliedFilters(defaultFilters);
		setTempDateRange("This Month");
		setDateRange("This Month");
		setIsFilterOpen(false);
		setCurrentPage(1);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search inventory by name or category..."
						className="w-full pl-10 h-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						className="flex items-center gap-2 h-10"
						onClick={() => setIsFilterOpen(true)}
					>
						<SlidersHorizontal className="h-4 w-4" />
						Filter
					</Button>
					<Button variant="outline" className="flex items-center gap-2 h-10">
						<Upload className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-white overflow-hidden shadow-sm">
				<Table>
					<TableHeader className="bg-gray-50/50">
						<TableRow className="border-border hover:bg-transparent">
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Product Name</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Category</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Current Stock</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Total Value</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center">
									<div className="flex items-center justify-center gap-2 text-muted-foreground">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
										Loading inventory data...
									</div>
								</TableCell>
							</TableRow>
						) : items.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
									No inventory items found matching your criteria.
								</TableCell>
							</TableRow>
						) : (
							items.map((item) => (
								<TableRow key={item.id} className="hover:bg-muted/30 border-border [&_td]:py-4 transition-colors">
									<TableCell className="font-medium text-foreground">{item.name}</TableCell>
									<TableCell className="text-muted-foreground text-sm">{item.category}</TableCell>
									<TableCell className="text-sm font-medium">{item.stock}</TableCell>
									<TableCell className="font-medium">Rs {item.value.toLocaleString()}</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className={cn(
												"font-normal border-0 px-2 py-0.5",
												item.status === 'In Stock' ? "bg-green-100 text-green-700" :
													item.status === 'Low Stock' ? "bg-amber-100 text-amber-700" :
														"bg-red-100 text-red-700"
											)}
										>
											{item.status}
										</Badge>
									</TableCell>
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between px-2">
					<p className="text-sm text-muted-foreground">
						Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{" "}
						<span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{" "}
						<span className="font-medium">{totalCount}</span> results
					</p>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
							disabled={currentPage === 1}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="text-sm font-medium">
							Page {currentPage} of {totalPages}
						</span>
						<Button
							variant="outline"
							size="icon"
							className="h-8 w-8"
							onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			<Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>Filter Inventory</DialogTitle>
						<DialogDescription>
							Search by category, status, or stock levels.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range</Label>
							<DateRangeSelector onRangeChange={setTempDateRange} initialRange={tempDateRange} />
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
							<div className="flex flex-wrap gap-4">
								{["Clothing", "Accessories", "Electronics", "Footwear"].map((cat) => (
									<div key={cat} className="flex items-center space-x-2">
										<Checkbox
											id={`cat-${cat}`}
											checked={tempFilters.categories.includes(cat)}
											onCheckedChange={(checked) => handleCategoryChange(cat, checked as boolean)}
										/>
										<label
											htmlFor={`cat-${cat}`}
											className="text-sm font-medium leading-none"
										>
											{cat}
										</label>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
							<div className="flex flex-wrap gap-4">
								{["In Stock", "Low Stock", "Out of Stock"].map((status) => (
									<div key={status} className="flex items-center space-x-2">
										<Checkbox
											id={`status-${status}`}
											checked={tempFilters.statuses.includes(status)}
											onCheckedChange={(checked) => handleStatusChange(status, checked as boolean)}
										/>
										<label
											htmlFor={`status-${status}`}
											className="text-sm font-medium leading-none"
										>
											{status}
										</label>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock Level Range</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label htmlFor="minStock" className="text-xs">Min Stock</Label>
									<Input
										id="minStock"
										type="number"
										placeholder="0"
										className="h-9"
										value={tempFilters.minStock}
										onChange={(e) => setTempFilters(prev => ({ ...prev, minStock: e.target.value }))}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="maxStock" className="text-xs">Max Stock</Label>
									<Input
										id="maxStock"
										type="number"
										placeholder="Any"
										className="h-9"
										value={tempFilters.maxStock}
										onChange={(e) => setTempFilters(prev => ({ ...prev, maxStock: e.target.value }))}
									/>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={handleResetFilters}>
							Reset
						</Button>
						<Button onClick={handleApplyFilters}>Apply Filters</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
