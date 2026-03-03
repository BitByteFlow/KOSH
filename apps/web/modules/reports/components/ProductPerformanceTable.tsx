import { useState, useMemo, useEffect } from "react";
import { Search, SlidersHorizontal, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { gql } from "@/gql";
import { getDateRange } from "@/lib/date-utils";
import { DateRangeSelector } from "@/modules/reports/components/DateRangeSelector";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { cn } from "@/lib/utils";

interface ProductPerformance {
	id: string;
	name: string;
	sku: string;
	category: string;
	sold: number;
	revenue: number;
	margin: number;
	status: string;
}

interface ProductPerformanceTableProps { }

const GET_PRODUCT_PERFORMANCE = gql(`
	query getProductPerformance ($filters: ProductPerformanceFilter!){
		getProductPerformance (filters: $filters) {
			items {
				id
				name
				sku
				category
				sold
				revenue
				margin
				status
			}
			totalCount
		}
	}
`) as any;

export function ProductPerformanceTable({ }: ProductPerformanceTableProps) {
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
		minSold: "",
		maxSold: "",
	});

	// State for filters currently being edited in the dialog
	const [tempFilters, setTempFilters] = useState({
		categories: [] as string[],
		statuses: [] as string[],
		minSold: "",
		maxSold: "",
	});

	// Debounce logic for search
	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setCurrentPage(1); // Reset to first page on search
		}, 500);
		return () => clearTimeout(handler);
	}, [searchQuery]);

	// Convert dateRange prop to actual dates
	const { startDate, endDate } = useMemo(() => getDateRange(dateRange), [dateRange]);

	const { data, loading } = useQuery<{ getProductPerformance: { items: ProductPerformance[], totalCount: number } }>(GET_PRODUCT_PERFORMANCE, {
		variables: {
			filters: {
				startDate,
				endDate,
				categories: appliedFilters.categories.length > 0 ? appliedFilters.categories : undefined,
				statuses: appliedFilters.statuses.length > 0 ? appliedFilters.statuses : undefined,
				minSold: appliedFilters.minSold ? parseInt(appliedFilters.minSold) : undefined,
				maxSold: appliedFilters.maxSold ? parseInt(appliedFilters.maxSold) : undefined,
				searchQuery: debouncedSearch || undefined,
				skip: (currentPage - 1) * pageSize,
				take: pageSize,
			}
		}
	});

	const products = data?.getProductPerformance?.items || [];
	const totalCount = data?.getProductPerformance?.totalCount || 0;
	const totalPages = Math.ceil(totalCount / pageSize);

	const handleCategoryChange = (category: string, checked: boolean) => {
		setTempFilters((prev) => ({
			...prev,
			categories: checked
				? [...prev.categories, category]
				: prev.categories.filter((c: string) => c !== category)
		}));
	};

	const handleStatusChange = (status: string, checked: boolean) => {
		setTempFilters((prev) => ({
			...prev,
			statuses: checked
				? [...prev.statuses, status]
				: prev.statuses.filter((s: string) => s !== status)
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
			minSold: "",
			maxSold: "",
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
						placeholder="Search products by name or SKU..."
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
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">SKU</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Units Sold</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Revenue</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Margin</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									<div className="flex items-center justify-center gap-2 text-muted-foreground">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
										Loading performance data...
									</div>
								</TableCell>
							</TableRow>
						) : products.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
									No products found matching your criteria.
								</TableCell>
							</TableRow>
						) : (
							products.map((product) => (
								<TableRow key={product.id} className="hover:bg-muted/30 border-border [&_td]:py-4 transition-colors">
									<TableCell className="font-medium text-foreground">{product.name}</TableCell>
									<TableCell className="text-muted-foreground text-sm font-mono">{product.sku}</TableCell>
									<TableCell className="text-sm font-medium">{product.sold}</TableCell>
									<TableCell className="font-medium">Rs {product.revenue.toLocaleString()}</TableCell>
									<TableCell className="text-sm text-green-600 font-semibold">{product.margin}%</TableCell>
									<TableCell>
										<Badge
											variant={product.status === 'Active' ? 'default' : 'secondary'}
											className={cn(
												"border-0",
												product.status === 'Active' ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700 hover:bg-red-100"
											)}
										>
											{product.status}
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
						<DialogTitle>Filter Product Performance</DialogTitle>
						<DialogDescription>
							Refine metrics by category, status, or units sold volume.
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
								{["Active", "Out of Stock"].map((status) => (
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
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Units Sold Range</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label htmlFor="minSold" className="text-xs">Min Units</Label>
									<Input
										id="minSold"
										type="number"
										placeholder="0"
										className="h-9"
										value={tempFilters.minSold}
										onChange={(e) => setTempFilters(prev => ({ ...prev, minSold: e.target.value }))}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="maxSold" className="text-xs">Max Units</Label>
									<Input
										id="maxSold"
										type="number"
										placeholder="Any"
										className="h-9"
										value={tempFilters.maxSold}
										onChange={(e) => setTempFilters(prev => ({ ...prev, maxSold: e.target.value }))}
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
