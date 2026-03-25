import React, { useState } from "react";
import { format } from "date-fns";
import {
	ShoppingBag,
	CreditCard,
	Banknote,
	History,
	ChevronRight,
	Search,
	RefreshCw,
	AlertCircle,
} from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { Card, CardContent, CardHeader } from "@kosh/ui/components/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { Badge } from "@kosh/ui/components/badge";
import { Input } from "@kosh/ui/components/input";
import { useAllSales } from "../hooks/useSales";

const TransactionsPage: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const { data, isLoading, error, refetch } = useAllSales();

	if (isLoading)
		return (
			<div className="p-8 flex items-center justify-center h-full">
				<div className="flex flex-col items-center gap-4">
					<RefreshCw className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
					<p className="font-bold text-slate-400 uppercase tracking-widest text-xs">
						Loading History
					</p>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="p-8 text-center text-red-500 h-full flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<AlertCircle className="w-12 h-12 text-red-400" />
					<div>
						<h3 className="text-xl font-bold">Error loading history</h3>
						<p>{(error as Error).message}</p>
					</div>
					<Button
						variant="outline"
						onClick={() => refetch()}
						className="mt-2"
					>
						Try Again
					</Button>
				</div>
			</div>
		);

	const transactions = data || [];
	const filteredTransactions = transactions.filter((tx: any) => {
		if (!searchTerm) return true;
		const search = searchTerm.toLowerCase();
		return (
			tx.id.toLowerCase().includes(search) ||
			tx.paymentType.toLowerCase().includes(search)
		);
	});

	return (
		<div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div>
					<h1 className="text-2xl font-black text-slate-900 tracking-tight">
						Your today's sales
					</h1>
					<p className="text-slate-500 font-medium mt-1 text-sm">
						Manage and audit your store sales.
					</p>
				</div>
			</div>

			<Card className="border-slate-200 bg-white shadow-sm overflow-hidden rounded-2xl">
				<CardHeader className="border-b border-slate-50 bg-slate-50/30">
					<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
						<div className="relative w-full sm:w-80">
							<Search
								className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
								size={16}
							/>
							<Input
								placeholder="Search by ID or payment type..."
								className="pl-10 bg-white border-slate-200 h-10"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<div className="flex items-center gap-4 text-sm font-bold text-slate-400">
							<span className="flex items-center gap-1.5">
								<div className="w-2 h-2 rounded-full bg-green-500" /> Completed
							</span>
							<span className="flex items-center gap-1.5">
								<div className="w-2 h-2 rounded-full bg-slate-100 border border-slate-300" />{" "}
								Draft
							</span>
						</div>
					</div>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader className="bg-slate-50/50">
							<TableRow className="hover:bg-transparent border-slate-100">
								<TableHead className="w-30 font-bold text-[10px] uppercase tracking-wider text-slate-400 py-4 pl-6">
									ID
								</TableHead>
								<TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
									Date & Time
								</TableHead>
								<TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
									Items
								</TableHead>
								<TableHead className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
									Method
								</TableHead>
								<TableHead className="text-right font-bold text-[10px] uppercase tracking-wider text-slate-400 pr-6">
									Amount
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filteredTransactions.map((transaction: any) => (
								<TableRow
									key={transaction.id}
									className="group border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
								>
									<TableCell className="py-4 pl-6">
										<span className="font-mono text-xs font-bold text-slate-500 group-hover:text-primary transition-colors uppercase">
											#{transaction.id.slice(0, 8)}
										</span>
									</TableCell>
									<TableCell>
										<div className="flex flex-col">
											<span className="font-bold text-slate-700 text-sm">
												{format(
													new Date(transaction.createdAt),
													"MMM dd, yyyy",
												)}
											</span>
											<span className="text-[10px] text-slate-400 font-medium">
												{format(new Date(transaction.createdAt), "hh:mm a")}
											</span>
										</div>
									</TableCell>
									<TableCell>
										<Badge
											variant="outline"
											className="bg-white border-slate-100 text-slate-500 font-bold px-1.5"
										>
											{transaction.items?.length || 0} items
										</Badge>
									</TableCell>
									<TableCell>
										<div className="flex items-center gap-2">
											{transaction.paymentType === "CASH" && (
												<Banknote
													size={14}
													className="text-green-500"
												/>
											)}
											{transaction.paymentType === "ONLINE" && (
												<CreditCard
													size={14}
													className="text-blue-500"
												/>
											)}
											{transaction.paymentType === "CREDIT" && (
												<History
													size={14}
													className="text-orange-500"
												/>
											)}
											<span className="text-xs font-bold text-slate-600 tracking-wide">
												{transaction.paymentType}
											</span>
										</div>
									</TableCell>
									<TableCell className="text-right pr-6">
										<div className="flex items-center justify-end gap-3">
											<span className="text-base font-bold text-slate-900">
												Rs. {transaction.total.toFixed(2)}
											</span>
											<div className="p-1 rounded-md opacity-0 group-hover:opacity-100 bg-white border border-slate-200 transition-all shadow-sm">
												<ChevronRight
													size={14}
													className="text-slate-400"
												/>
											</div>
										</div>
									</TableCell>
								</TableRow>
							))}

							{filteredTransactions.length === 0 && (
								<TableRow>
									<TableCell
										colSpan={5}
										className="h-64 text-center"
									>
										<div className="flex flex-col items-center justify-center text-slate-400 gap-2">
											<ShoppingBag
												size={48}
												className="text-slate-200"
											/>
											<p className="font-bold">
												{searchTerm
													? `No results for "${searchTerm}"`
													: "No transactions found"}
											</p>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default TransactionsPage;
