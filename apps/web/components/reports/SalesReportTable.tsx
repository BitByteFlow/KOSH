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

const MOCK_SALES = [
	{ id: "INV-001", date: "2023-10-25", customer: "Walk-in Customer", items: 3, total: 1200.00, payment: "Cash", status: "Completed" },
	{ id: "INV-002", date: "2023-10-25", customer: "John Doe", items: 1, total: 4500.00, payment: "Online", status: "Completed" },
	{ id: "INV-003", date: "2023-10-24", customer: "Jane Smith", items: 5, total: 8250.00, payment: "Credit", status: "Pending" },
	{ id: "INV-004", date: "2023-10-24", customer: "Walk-in Customer", items: 2, total: 350.00, payment: "Cash", status: "Completed" },
];

export function SalesReportTable() {
	const [searchQuery, setSearchQuery] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filters, setFilters] = useState({
		dateFrom: "",
		dateTo: "",
		paymentMethods: [] as string[],
		statuses: [] as string[],
	});

	const filteredSales = useMemo(() => {
		return MOCK_SALES.filter(sale => {
			const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sale.customer.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesDateFrom = !filters.dateFrom || new Date(sale.date) >= new Date(filters.dateFrom);
			const matchesDateTo = !filters.dateTo || new Date(sale.date) <= new Date(filters.dateTo);
			const matchesPayment = filters.paymentMethods.length === 0 || filters.paymentMethods.includes(sale.payment);
			const matchesStatus = filters.statuses.length === 0 || filters.statuses.includes(sale.status);

			return matchesSearch && matchesDateFrom && matchesDateTo && matchesPayment && matchesStatus;
		});
	}, [searchQuery, filters]);

	const handlePaymentChange = (type: string, checked: boolean) => {
		setFilters(prev => ({
			...prev,
			paymentMethods: checked
				? [...prev.paymentMethods, type]
				: prev.paymentMethods.filter(t => t !== type)
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
						placeholder="Search sales by ID or customer..."
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
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Invoice</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Date</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Customer</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Items</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Total</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Payment</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredSales.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
									No sales found matching your criteria.
								</TableCell>
							</TableRow>
						) : (
							filteredSales.map((sale) => (
								<TableRow key={sale.id} className="hover:bg-muted/30 border-border [&_td]:py-4 transition-colors">
									<TableCell className="font-medium text-foreground">{sale.id}</TableCell>
									<TableCell className="text-muted-foreground text-sm">{sale.date}</TableCell>
									<TableCell className="text-sm">{sale.customer}</TableCell>
									<TableCell className="text-sm">{sale.items}</TableCell>
									<TableCell className="font-medium">Rs {sale.total.toLocaleString()}</TableCell>
									<TableCell>
										<Badge variant="outline" className="font-normal">{sale.payment}</Badge>
									</TableCell>
									<TableCell>
										<Badge
											variant={sale.status === 'Completed' ? 'default' : 'secondary'}
											className={sale.status === 'Completed' ? "bg-green-100 text-green-700 hover:bg-green-100 border-0" : "bg-orange-100 text-orange-700 hover:bg-orange-100 border-0"}
										>
											{sale.status}
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
						<DialogTitle>Filter Sales</DialogTitle>
						<DialogDescription>
							Adjust filters to find specific sales records.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label htmlFor="dateFrom" className="text-xs">From</Label>
									<Input
										id="dateFrom"
										type="date"
										className="h-9"
										value={filters.dateFrom}
										onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="dateTo" className="text-xs">To</Label>
									<Input
										id="dateTo"
										type="date"
										className="h-9"
										value={filters.dateTo}
										onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
									/>
								</div>
							</div>
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Method</Label>
							<div className="flex flex-wrap gap-4">
								{["Online", "Cash", "Credit"].map((type) => (
									<div key={type} className="flex items-center space-x-2">
										<Checkbox
											id={`payment-${type}`}
											checked={filters.paymentMethods.includes(type)}
											onCheckedChange={(checked) => handlePaymentChange(type, checked as boolean)}
										/>
										<label
											htmlFor={`payment-${type}`}
											className="text-sm font-medium leading-none"
										>
											{type}
										</label>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
							<div className="flex flex-wrap gap-4">
								{["Completed", "Pending"].map((status) => (
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
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => {
							setFilters({
								dateFrom: "",
								dateTo: "",
								paymentMethods: [],
								statuses: [],
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
