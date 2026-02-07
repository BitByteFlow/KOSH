import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Upload } from "lucide-react";
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

const MOCK_PRODUCTS = [
	{ id: "PROD-001", name: "Cotton T-Shirt", sku: "TS-001", category: "Clothing", sold: 154, revenue: 46200.00, margin: 32, status: "Active" },
	{ id: "PROD-002", name: "Leather Wallet", sku: "WL-002", category: "Accessories", sold: 89, revenue: 66750.00, margin: 45, status: "Active" },
	{ id: "PROD-003", name: "Wireless Earbuds", sku: "EB-003", category: "Electronics", sold: 210, revenue: 315000.00, margin: 28, status: "Active" },
	{ id: "PROD-004", name: "Running Shoes", sku: "SH-004", category: "Footwear", sold: 42, revenue: 147000.00, margin: 15, status: "Out of Stock" },
];

export function ProductPerformanceTable() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filters, setFilters] = useState({
		categories: [] as string[],
		statuses: [] as string[],
		minSold: "",
		maxSold: "",
	});

	const filteredProducts = useMemo(() => {
		return MOCK_PRODUCTS.filter(product => {
			const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				product.sku.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesCategory = filters.categories.length === 0 || filters.categories.includes(product.category);
			const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(product.status);
			const matchesMinSold = !filters.minSold || product.sold >= parseInt(filters.minSold);
			const matchesMaxSold = !filters.maxSold || product.sold <= parseInt(filters.maxSold);

			return matchesSearch && matchesCategory && matchesStatus && matchesMinSold && matchesMaxSold;
		});
	}, [searchQuery, filters]);

	const handleCategoryChange = (category: string, checked: boolean) => {
		setFilters(prev => ({
			...prev,
			categories: checked
				? [...prev.categories, category]
				: prev.categories.filter(c => c !== category)
		}));
	};

	const handleStatusChange = (status: string, checked: boolean) => {
		setFilters(prev => ({
			...prev,
			statuses: checked
				? [...prev.statuses, status]
				: prev.statuses.filter(s => s !== status)
		}));
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
						{filteredProducts.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
									No products found matching your criteria.
								</TableCell>
							</TableRow>
						) : (
							filteredProducts.map((product) => (
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

			<Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Filter Product Performance</DialogTitle>
						<DialogDescription>
							Refine metrics by category, status, or units sold volume.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
							<div className="flex flex-wrap gap-4">
								{["Clothing", "Accessories", "Electronics", "Footwear"].map((cat) => (
									<div key={cat} className="flex items-center space-x-2">
										<Checkbox
											id={`cat-${cat}`}
											checked={filters.categories.includes(cat)}
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
											checked={filters.statuses.includes(status)}
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
										value={filters.minSold}
										onChange={(e) => setFilters(prev => ({ ...prev, minSold: e.target.value }))}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="maxSold" className="text-xs">Max Units</Label>
									<Input
										id="maxSold"
										type="number"
										placeholder="Any"
										className="h-9"
										value={filters.maxSold}
										onChange={(e) => setFilters(prev => ({ ...prev, maxSold: e.target.value }))}
									/>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => {
							setFilters({
								categories: [],
								statuses: [],
								minSold: "",
								maxSold: "",
							});
						}}>
							Reset
						</Button>
						<Button onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
