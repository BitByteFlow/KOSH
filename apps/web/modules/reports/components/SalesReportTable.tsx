"use client";

import { useState, useMemo, useEffect } from "react";
import {
	Search,
	SlidersHorizontal,
	Upload,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
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
import { useQuery } from "@apollo/client/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getDateRange } from "@/lib/date-utils";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";
import { SaleReport, SaleReportFilter, PaymentType } from "@/gql/graphql";
import { GET_SALES_REPORT } from "@/services/reportsAnalytics.service";
import { formatCurrency } from "@/lib/utils";

interface SalesReportMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	hasNext: boolean;
	hasPrev: boolean;
}

export function SalesReportTable() {
	const [dateRange, setDateRange] = useState("This Month");
	const [tempDateRange, setTempDateRange] = useState("This Month");
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(10);

	const [appliedFilters, setAppliedFilters] = useState({
		paymentMethods: [] as PaymentType[],
		statuses: [] as string[],
	});

	const [tempFilters, setTempFilters] = useState({
		paymentMethods: [] as PaymentType[],
		statuses: [] as string[],
	});

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(searchQuery);
		}, 500);
		return () => clearTimeout(handler);
	}, [searchQuery]);

	const { startDate, endDate } = useMemo(
		() => getDateRange(dateRange),
		[dateRange],
	);

	const { data: rawData, loading } = useQuery(GET_SALES_REPORT, {
		variables: {
			filters: {
				startDate,
				endDate,
				paymentMethods:
					appliedFilters.paymentMethods.length > 0
						? (appliedFilters.paymentMethods as PaymentType[])
						: undefined,
				statuses:
					appliedFilters.statuses.length > 0
						? appliedFilters.statuses
						: undefined,
				searchQuery: debouncedSearch || undefined,
				page,
				limit: pageSize,
			} as SaleReportFilter,
		},
	});

	const salesResponse = useMemo(
		() => parseGraphQLListResponse(rawData?.getSalesReport),
		[rawData?.getSalesReport],
	);

	const filteredSales = salesResponse.data || [];
	const meta = salesResponse.meta as SalesReportMeta | undefined;

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= (meta?.totalPages || 1)) {
			setPage(newPage);
		}
	};

	if (loading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	const handleExport = () => {
		const doc = new jsPDF();
		doc.text("Sales Report", 14, 15);
		doc.setFontSize(10);
		doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

		const tableData = filteredSales.map((sale: SaleReport) => [
			sale.id,
			sale.date,
			sale.customer,
			sale.items.toString(),
			formatCurrency(sale.total),
			sale.payment,
			sale.status,
		]);

		autoTable(doc, {
			startY: 30,
			head: [
				["Invoice", "Date", "Customer", "Items", "Total", "Payment", "Status"],
			],
			body: tableData,
		});

		doc.save(`sales-report-${new Date().toISOString().split("T")[0]}.pdf`);
	};

	const handlePaymentMethodChange = (method: PaymentType, checked: boolean) => {
		setTempFilters((prev: any) => {
			const paymentMethods = checked
				? [...prev.paymentMethods, method]
				: prev.paymentMethods.filter((m: PaymentType) => m !== method);
			return { ...prev, paymentMethods };
		});
	};

	const handleStatusChange = (status: string, checked: boolean) => {
		setTempFilters((prev: any) => {
			const statuses = checked
				? [...prev.statuses, status]
				: prev.statuses.filter((s: string) => s !== status);
			return { ...prev, statuses };
		});
	};

	const handleApplyFilters = () => {
		if (!tempDateRange) return;
		setAppliedFilters(tempFilters);
		setDateRange(tempDateRange);
		setPage(1);
		setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		const defaultFilters = {
			paymentMethods: [],
			statuses: [],
		};
		setTempFilters(defaultFilters);
		setAppliedFilters(defaultFilters);
		setTempDateRange("This Month");
		setDateRange("This Month");
		setPage(1);
		setIsFilterOpen(false);
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
					<Button
						variant="outline"
						className="flex items-center gap-2 h-10"
						onClick={handleExport}
					>
						<Upload className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className="rounded-lg border border-border bg-gray-50 overflow-hidden shadow-sm">
				<Table>
					<TableHeader className="bg-gray-50/50">
						<TableRow className="border-border hover:bg-transparent">
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">
								Invoice
							</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">
								Date
							</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">
								Customer
							</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">
								Items
							</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">
								Total
							</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">
								Payment
							</TableHead>
							<TableHead className="font-semibold text-xs tracking-wider uppercase text-muted-foreground/80 h-12">
								Status
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredSales.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={7}
									className="h-24 text-center text-muted-foreground"
								>
									No sales found matching your criteria.
								</TableCell>
							</TableRow>
						) : (
							filteredSales.map((sale: SaleReport) => (
								<TableRow
									key={sale.id}
									className="hover:bg-muted/30 border-border [&_td]:py-4 transition-colors"
								>
									<TableCell className="font-medium">{sale.id}</TableCell>
									<TableCell>{sale.date}</TableCell>
									<TableCell>{sale.customer}</TableCell>
									<TableCell>{sale.items}</TableCell>
									<TableCell className="font-medium">
										{formatCurrency(sale.total)}
									</TableCell>
									<TableCell>{sale.payment}</TableCell>
									<TableCell>
										<Badge
											variant={
												sale.status === "Completed" ? "default" : "secondary"
											}
											className={
												sale.status === "Completed"
													? "bg-green-100 text-green-700 hover:bg-green-100 border-0"
													: "bg-orange-100 text-orange-700 hover:bg-orange-100 border-0"
											}
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

			{meta && meta.totalPages > 1 && (
				<div className="flex items-center justify-between p-4 border-t border-border bg-gray-50 rounded-lg">
					<div className="text-sm text-muted-foreground">
						Showing {meta.total === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
						{Math.min(page * pageSize, meta.total)} of {meta.total} results
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(1)}
							disabled={!meta.hasPrev}
							className="h-8"
						>
							First
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page - 1)}
							disabled={!meta.hasPrev}
							className="h-8 w-8 p-0"
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>

						<div className="flex items-center gap-1">
							{Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
								let pageNum: number;
								if (meta.totalPages <= 5) {
									pageNum = i + 1;
								} else if (page <= 3) {
									pageNum = i + 1;
								} else if (page >= meta.totalPages - 2) {
									pageNum = meta.totalPages - 4 + i;
								} else {
									pageNum = page - 2 + i;
								}

								return (
									<Button
										key={pageNum}
										variant={pageNum === page ? "default" : "outline"}
										size="sm"
										className="w-8 h-8"
										onClick={() => handlePageChange(pageNum)}
									>
										{pageNum}
									</Button>
								);
							})}
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(page + 1)}
							disabled={!meta.hasNext}
							className="h-8 w-8 p-0"
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => handlePageChange(meta.totalPages)}
							disabled={!meta.hasNext}
							className="h-8"
						>
							Last
						</Button>
					</div>
				</div>
			)}

			<Dialog
				open={isFilterOpen}
				onOpenChange={setIsFilterOpen}
			>
				<DialogContent className="sm:max-w-150">
					<DialogHeader>
						<DialogTitle>Filter Sales</DialogTitle>
						<DialogDescription>
							Adjust filters to find specific sales records.
						</DialogDescription>
					</DialogHeader>

					<div className="grid gap-6 py-4">
						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Date Range
							</Label>
							<DateRangeSelector
								onRangeChange={setTempDateRange}
								initialRange={tempDateRange}
							/>
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Payment Method
							</Label>
							<div className="flex flex-wrap gap-4">
								{[
									{ label: "Online", value: PaymentType.Online },
									{ label: "Cash", value: PaymentType.Cash },
									{ label: "Credit", value: PaymentType.Credit },
								].map(({ label, value }) => (
									<div
										key={value}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={`payment-${value}`}
											checked={tempFilters.paymentMethods.includes(value)}
											onCheckedChange={(checked) =>
												handlePaymentMethodChange(value, !!checked)
											}
										/>
										<label
											htmlFor={`payment-${value}`}
											className="text-sm font-medium leading-none"
										>
											{label}
										</label>
									</div>
								))}
							</div>
						</div>

						<div className="space-y-3">
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
								Status
							</Label>
							<div className="flex flex-wrap gap-4">
								{["Completed", "Pending"].map((status) => (
									<div
										key={status}
										className="flex items-center space-x-2"
									>
										<Checkbox
											id={`status-${status}`}
											checked={tempFilters.statuses.includes(status)}
											onCheckedChange={(checked) =>
												handleStatusChange(status, checked as boolean)
											}
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
						<Button
							variant="outline"
							onClick={handleResetFilters}
						>
							Reset
						</Button>
						<Button onClick={handleApplyFilters}>Apply Filters</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
