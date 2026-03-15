import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, Upload, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useQuery } from "@apollo/client/react";
import { getDateRange } from "@/lib/date-utils";
import {
	GetAnalyticsTransactionsQuery,
	GetAnalyticsTransactionsQueryVariables,
	AnalyticsTransaction,
} from "@/gql/graphql";
import { GET_ANALYTICS_TRANSACTIONS } from "@/services/reportsAnalytics.service";
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

interface Transaction {
	id: string;
	date: string;
	time: string;
	paymentType: "Online" | "Cash" | "Credit";
	amount: number;
	profit: number;
	status: "Completed" | "Pending";
}

interface AnalyticsTransactionTableProps { }

interface FilterState {
	paymentTypes: string[];
	status: string;
	minAmount: string;
	maxAmount: string;
}

export function AnalyticsTransactionTable({ }: AnalyticsTransactionTableProps) {
	const [dateRange, setDateRange] = useState("This Month");
	const [tempDateRange, setTempDateRange] = useState("This Month");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);

	const [currentPage, setCurrentPage] = useState(1);
	const pageSize = 10;

	const [appliedFilters, setAppliedFilters] = useState<FilterState>({
		paymentTypes: [],
		status: "all",
		minAmount: "",
		maxAmount: "",
	});

	const [tempFilters, setTempFilters] = useState<FilterState>({
		paymentTypes: [],
		status: "all",
		minAmount: "",
		maxAmount: "",
	});

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(searchQuery);
			setCurrentPage(1); 
		}, 500);
		return () => clearTimeout(handler);
	}, [searchQuery]);

	const { startDate, endDate } = useMemo(() => getDateRange(dateRange), [dateRange]);

	const { data: rawData, loading } = useQuery<GetAnalyticsTransactionsQuery, GetAnalyticsTransactionsQueryVariables>(GET_ANALYTICS_TRANSACTIONS, {
		variables: {
			filters: {
				startDate,
				endDate,
				paymentTypes: appliedFilters.paymentTypes.length > 0 ? appliedFilters.paymentTypes : undefined,
				status: appliedFilters.status !== "all" ? appliedFilters.status : undefined,
				minAmount: appliedFilters.minAmount ? parseFloat(appliedFilters.minAmount) : undefined,
				maxAmount: appliedFilters.maxAmount ? parseFloat(appliedFilters.maxAmount) : undefined,
				searchQuery: debouncedSearch || undefined,
				skip: (currentPage - 1) * pageSize,
				take: pageSize,
			}
		}
	});

	const transactions = useMemo(() =>
		rawData?.getAnalyticsTransactions?.data || [],
		[rawData]
	);

	const totalCount = rawData?.getAnalyticsTransactions?.totalCount || 0;
	const totalPages = Math.ceil(totalCount / pageSize);

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

	const handleTypeChange = (type: string, checked: boolean) => {
		setTempFilters((prev: FilterState) => {
			const paymentTypes = checked
				? [...prev.paymentTypes, type]
				: prev.paymentTypes.filter((t: string) => t !== type);
			return { ...prev, paymentTypes };
		});
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
			paymentTypes: [],
			status: "all",
			minAmount: "",
			maxAmount: "",
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
						placeholder="Search transactions..."
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
						{loading ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center">
									<div className="flex items-center justify-center gap-2 text-muted-foreground">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
										Loading transactions...
									</div>
								</TableCell>
							</TableRow>
						) : transactions.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
									No transactions found matching your criteria.
								</TableCell>
							</TableRow>
						) : (
							transactions.map((transaction: AnalyticsTransaction) => (
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
										Rs {transaction.amount.toLocaleString()}
									</TableCell>
									<TableCell
										className={cn(
											"font-medium",
											transaction.profit < 0
												? "text-red-600"
												: "text-green-600"
										)}
									>
										Rs {transaction.profit.toLocaleString()}
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
							))
						)}
					</TableBody>
				</Table>
			</div>

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
						<DialogTitle>Filter Transactions</DialogTitle>
						<DialogDescription>
							Refine your transaction search with the following filters.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Range</Label>
							<DateRangeSelector onRangeChange={setTempDateRange} initialRange={tempDateRange} />
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Type</Label>
							<div className="flex flex-wrap gap-4">
								{[
									{ label: "Online", value: "ONLINE" },
									{ label: "Cash", value: "CASH" },
									{ label: "Credit", value: "CREDIT" },
								].map(({ label, value }) => (
									<div key={value} className="flex items-center space-x-2">
										<Checkbox
											id={`payment-${value}`}
											checked={tempFilters.paymentTypes.includes(value)}
											onCheckedChange={(checked) => handleTypeChange(value, checked as boolean)}
										/>
										<label
											htmlFor={`payment-${value}`}
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
										>
											{label}
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
								value={tempFilters.status}
								onChange={(e) => setTempFilters(prev => ({ ...prev, status: e.target.value }))}
							>
								<option value="all">All Status</option>
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
											value={tempFilters.minAmount}
											onChange={(e) => setTempFilters(prev => ({ ...prev, minAmount: e.target.value }))}
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
											value={tempFilters.maxAmount}
											onChange={(e) => setTempFilters(prev => ({ ...prev, maxAmount: e.target.value }))}
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

