"use client";

import { useState, useMemo, useEffect } from "react";
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
import { useQuery } from "@apollo/client/react";
import { gql } from "@/gql";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getDateRange } from "@/lib/date-utils";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";
import { PaymentType } from "@/gql/graphql";

interface SalesReportTableProps {
	dateRange: string;
}

const GET_SALES_REPORT = gql(`
	query getSalesReport ($filters: SaleReportFilter!){
		getSalesReport (filters: $filters) {
			success
			message
			data {
				id
				date
				customer
				items
				total
				payment
				status
			}
		}
	}
`)

export function SalesReportTable({ dateRange }: SalesReportTableProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [isFilterOpen, setIsFilterOpen] = useState(false);

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

	const { startDate, endDate } = useMemo(() => getDateRange(dateRange), [dateRange]);

	const { data: rawData, loading } = useQuery(GET_SALES_REPORT, {
		variables: {
			filters: {
				startDate,
				endDate,
				paymentMethods: appliedFilters.paymentMethods.length > 0 ? appliedFilters.paymentMethods : undefined,
				statuses: appliedFilters.statuses.length > 0 ? appliedFilters.statuses : undefined,
				searchQuery: debouncedSearch || undefined,
			}
		}
	});

	const salesResponse = useMemo(() =>
		parseGraphQLListResponse(rawData?.getSalesReport),
		[rawData?.getSalesReport]
	);

	const filteredSales = salesResponse.data || [];

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

		const tableData = filteredSales.map(sale => [
			sale.id,
			sale.date,
			sale.customer,
			sale.items.toString(),
			`Rs ${sale.total.toLocaleString()}`,
			sale.payment,
			sale.status
		]);

		autoTable(doc, {
			startY: 30,
			head: [["Invoice", "Date", "Customer", "Items", "Total", "Payment", "Status"]],
			body: tableData,
		});

		doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
	};

	const handlePaymentChange = (type: PaymentType, checked: boolean) => {
		setTempFilters((prev) => ({
			...prev,
			paymentMethods: checked
				? [...prev.paymentMethods, type]
				: prev.paymentMethods.filter((t: PaymentType) => t !== type)
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
		setAppliedFilters(tempFilters);
		setIsFilterOpen(false);
	};

	const handleResetFilters = () => {
		const defaultFilters = {
			paymentMethods: [],
			statuses: [],
		};
		setTempFilters(defaultFilters);
		setAppliedFilters(defaultFilters);
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
							<Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Payment Method</Label>
							<div className="flex flex-wrap gap-4">
								{["Online", "Cash", "Credit"].map((type) => (
									<div key={type} className="flex items-center space-x-2">
										<Checkbox
											id={`payment-${type}`}
											checked={tempFilters.paymentMethods.includes(type as PaymentType)}
											onCheckedChange={(checked) => handlePaymentChange(type as PaymentType, checked as boolean)}
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
