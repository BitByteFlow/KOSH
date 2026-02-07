import { useState } from "react";
import { Search, SlidersHorizontal, Upload, X } from "lucide-react";
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

interface Transaction {
	id: string;
	date: string;
	time: string;
	paymentType: "Online" | "Cash" | "Credit";
	amount: string;
	profit: string;
	status: "Completed" | "Pending";
}

interface AnalyticsTransactionTableProps {
	transactions: Transaction[];
}

interface FilterState {
	dateFrom: string;
	dateTo: string;
	paymentTypes: string[];
	status: string;
	minAmount: string;
	maxAmount: string;
}

export function AnalyticsTransactionTable({
	transactions,
}: AnalyticsTransactionTableProps) {
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [filters, setFilters] = useState<FilterState>({
		dateFrom: "",
		dateTo: "",
		paymentTypes: [],
		status: "all",
		minAmount: "",
		maxAmount: "",
	});

	const getPaymentVariant = (
		type: string
	): "default" | "secondary" | "outline" | "destructive" => {
		switch (type) {
			case "Online":
				return "default";
			case "Cash":
				return "secondary";
			case "Credit":
				return "outline";
			default:
				return "outline";
		}
	};

	const handlePaymentTypeChange = (type: string, checked: boolean) => {
		setFilters(prev => {
			const types = checked
				? [...prev.paymentTypes, type]
				: prev.paymentTypes.filter(t => t !== type);
			return { ...prev, paymentTypes: types };
		});
	};

	const handleApplyFilters = () => {
		console.log("Applying filters:", filters);
		setIsFilterOpen(false);
		// Implement actual filtering logic here
	};

	const handleResetFilters = () => {
		setFilters({
			dateFrom: "",
			dateTo: "",
			paymentTypes: [],
			status: "all",
			minAmount: "",
			maxAmount: "",
		});
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search transactions..."
						className="w-full pl-10 h-10"
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
					<Button
						variant="outline"
						className="flex items-center gap-2 h-10"
					>
						<Upload className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-white overflow-hidden shadow-sm">
				<Table>
					<TableHeader className="bg-gray-50/50">
						<TableRow className="border-border hover:bg-transparent">
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Transaction ID</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Date & Time</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Payment Type</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Amount</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Profit</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{transactions.map((transaction) => (
							<TableRow
								key={transaction.id}
								className="hover:bg-muted/30 border-border [&_td]:py-4 transition-colors"
							>
								<TableCell className="font-medium text-foreground">{transaction.id}</TableCell>
								<TableCell className="text-muted-foreground text-sm">
									{transaction.date} <span className="text-muted-foreground/60 ml-1">{transaction.time}</span>
								</TableCell>
								<TableCell>
									<Badge variant={getPaymentVariant(transaction.paymentType)} className="font-normal">
										{transaction.paymentType}
									</Badge>
								</TableCell>
								<TableCell className="font-medium">
									{transaction.amount}
								</TableCell>
								<TableCell
									className={cn(
										"font-medium",
										transaction.profit.startsWith("-")
											? "text-red-600"
											: "text-green-600"
									)}
								>
									{transaction.profit}
								</TableCell>
								<TableCell>
									<div className={cn(
										"inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
										transaction.status === "Completed"
											? "bg-green-50 text-green-700"
											: "bg-orange-50 text-orange-700"
									)}>
										{transaction.status}
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			<Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Filter Transactions</DialogTitle>
						<DialogDescription>
							Refine your transaction search with the following filters.
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
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Type</Label>
							<div className="flex flex-wrap gap-4">
								{["Online", "Cash", "Credit"].map((type) => (
									<div key={type} className="flex items-center space-x-2">
										<Checkbox
											id={`payment-${type}`}
											checked={filters.paymentTypes.includes(type)}
											onCheckedChange={(checked) => handlePaymentTypeChange(type, checked as boolean)}
										/>
										<label
											htmlFor={`payment-${type}`}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{type}
										</label>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-3">
							<Label htmlFor="status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</Label>
							<select
								id="status"
								className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
								value={filters.status}
								onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
							>
								<option value="all">All Statuses</option>
								<option value="Completed">Completed</option>
								<option value="Pending">Pending</option>
							</select>
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount Range</Label>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1.5">
									<Label htmlFor="minAmount" className="text-xs">Min</Label>
									<div className="relative">
										<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">Rs</span>
										<Input
											id="minAmount"
											type="number"
											placeholder="0"
											className="h-9 pl-7"
											value={filters.minAmount}
											onChange={(e) => setFilters(prev => ({ ...prev, minAmount: e.target.value }))}
										/>
									</div>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="maxAmount" className="text-xs">Max</Label>
									<div className="relative">
										<span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">Rs</span>
										<Input
											id="maxAmount"
											type="number"
											placeholder="Any"
											className="h-9 pl-7"
											value={filters.maxAmount}
											onChange={(e) => setFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<DialogFooter className="flex-row gap-2 sm:justify-end">
						<Button variant="ghost" onClick={handleResetFilters} className="text-muted-foreground hover:text-foreground">
							Reset
						</Button>
						<Button onClick={handleApplyFilters}>
							Apply Filters
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

