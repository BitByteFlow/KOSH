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

const MOCK_ITEMS = [
	{ id: "ITEM-001", name: "Cotton T-Shirt", category: "Clothing", stock: 450, value: 135000.00, status: "In Stock" },
	{ id: "ITEM-002", name: "Leather Wallet", category: "Accessories", stock: 12, value: 18000.00, status: "Low Stock" },
	{ id: "ITEM-003", name: "Wireless Earbuds", category: "Electronics", stock: 85, value: 127500.00, status: "In Stock" },
	{ id: "ITEM-004", name: "Running Shoes", category: "Footwear", stock: 0, value: 0.00, status: "Out of Stock" },
];

export function InventoryReportTable() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filters, setFilters] = useState({
		categories: [] as string[],
		statuses: [] as string[],
		minStock: "",
		maxStock: "",
	});

	const filteredItems = useMemo(() => {
		return MOCK_ITEMS.filter(item => {
			const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.category.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesCategory = filters.categories.length === 0 || filters.categories.includes(item.category);
			const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(item.status);
			const matchesMinStock = !filters.minStock || item.stock >= parseInt(filters.minStock);
			const matchesMaxStock = !filters.maxStock || item.stock <= parseInt(filters.maxStock);

			return matchesSearch && matchesCategory && matchesStatus && matchesMinStock && matchesMaxStock;
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
						{filteredItems.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
									No inventory items found matching your criteria.
								</TableCell>
							</TableRow>
						) : (
							filteredItems.map((item) => (
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

			<Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Filter Inventory</DialogTitle>
						<DialogDescription>
							Search by category, status, or stock levels.
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
								{["In Stock", "Low Stock", "Out of Stock"].map((status) => (
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
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Stock Level Range</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label htmlFor="minStock" className="text-xs">Min Stock</Label>
									<Input
										id="minStock"
										type="number"
										placeholder="0"
										className="h-9"
										value={filters.minStock}
										onChange={(e) => setFilters(prev => ({ ...prev, minStock: e.target.value }))}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="maxStock" className="text-xs">Max Stock</Label>
									<Input
										id="maxStock"
										type="number"
										placeholder="Any"
										className="h-9"
										value={filters.maxStock}
										onChange={(e) => setFilters(prev => ({ ...prev, maxStock: e.target.value }))}
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
								minStock: "",
								maxStock: "",
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
