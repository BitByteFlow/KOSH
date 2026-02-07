import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, Upload, FileText, Printer, Eye, MoreHorizontal, ShoppingCart } from "lucide-react";
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
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@kosh/ui/components/dropdown-menu";

const MOCK_SALES = [
	{ id: "INV-001", date: "2025-07-06", customer: "Robert Fox", items: 3, total: 1200.00, payment: "Cash", status: "Completed" },
	{ id: "INV-002", date: "2025-07-06", customer: "Cody Fisher", items: 1, total: 850.50, payment: "Online", status: "Completed" },
	{ id: "INV-003", date: "2025-07-05", customer: "Esther Howard", items: 5, total: 3420.00, payment: "Credit", status: "Pending" },
	{ id: "INV-004", date: "2025-07-05", customer: "Jenny Wilson", items: 2, total: 150.00, payment: "Cash", status: "Refunded" },
];

export function SalesHistoryTable() {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredSales = useMemo(() => {
		return MOCK_SALES.filter(sale =>
			sale.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
			sale.id.toLowerCase().includes(searchQuery.toLowerCase())
		);
	}, [searchQuery]);

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between gap-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						placeholder="Search invoice or customer..."
						className="pl-9 h-10"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" className="flex items-center gap-2 h-10">
						<SlidersHorizontal className="h-4 w-4" />
						Filter
					</Button>
					<Button variant="outline" className="flex items-center gap-2 h-10">
						<Upload className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden">
				<Table>
					<TableHeader className="bg-muted/50">
						<TableRow>
							<TableHead className="w-[100px]">Invoice</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Customer</TableHead>
							<TableHead className="text-center">Items</TableHead>
							<TableHead>Payment</TableHead>
							<TableHead className="text-right">Total</TableHead>
							<TableHead>Status</TableHead>
							<TableHead className="w-[50px]"></TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{filteredSales.map((sale) => (
							<TableRow key={sale.id} className="hover:bg-muted/50">
								<TableCell className="font-medium">{sale.id}</TableCell>
								<TableCell className="text-muted-foreground">{sale.date}</TableCell>
								<TableCell className="font-medium text-foreground">{sale.customer}</TableCell>
								<TableCell className="text-center">{sale.items}</TableCell>
								<TableCell>
									<Badge variant="secondary" className="font-normal">
										{sale.payment}
									</Badge>
								</TableCell>
								<TableCell className="text-right font-medium">
									Rs {sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
								</TableCell>
								<TableCell>
									<Badge
										className={
											sale.status === 'Completed' ? "bg-green-100 text-green-700 hover:bg-green-100 border-0" :
												sale.status === 'Pending' ? "bg-amber-100 text-amber-700 hover:bg-amber-100 border-0" :
													"bg-red-100 text-red-700 hover:bg-red-100 border-0"
										}
									>
										{sale.status}
									</Badge>
								</TableCell>
								<TableCell>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
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
											<DropdownMenuSeparator />
											<DropdownMenuItem className="text-red-600">
												Refund Sale
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
