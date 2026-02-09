"use client";

import { useState } from "react";
import { Card } from "@kosh/ui/components/card";
import { Button } from "@kosh/ui/components/button";
import { Badge } from "@kosh/ui/components/badge";
import { ChevronLeft, ChevronRight, Pencil, Loader2 } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { useAccountTransactions } from "../hooks/useAccount";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import type { Transaction } from "@/services/account.service";

const TRANSACTION_TYPE_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
	INITIAL_CAPITAL: { label: "Initial Capital", variant: "default" },
	ADDITIONAL_CAPITAL: { label: "Additional Capital", variant: "default" },
	SALE_INCOME: { label: "Sale Income", variant: "default" },
	CREDIT_RECEIVED: { label: "Credit Received", variant: "default" },
	WITHDRAWAL: { label: "Withdrawal", variant: "destructive" },
	PURCHASE: { label: "Purchase", variant: "destructive" },
	EXPENSES: { label: "Expenses", variant: "destructive" },
	DEBT_PAID: { label: "Debt Paid", variant: "destructive" },
	DEBT: { label: "Debt", variant: "outline" },
};

export function TransactionTable() {
	const [page, setPage] = useState(1);
	const limit = 10;

	const { data, isLoading, error } = useAccountTransactions({
		page,
		limit,
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const handlePreviousPage = () => {
		if (data?.meta.hasPrev) {
			setPage((prev) => prev - 1);
		}
	};

	const handleNextPage = () => {
		if (data?.meta.hasNext) {
			setPage((prev) => prev + 1);
		}
	};

	return (
		<Card className="border border-border gap-2 p-6 overflow-hidden rounded-lg shadow-md">
			<div className="flex items-center justify-between py-2 border-b border-border">
				<h2 className="text-lg font-bold">Recent Transactions</h2>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{data?.meta.total ? `${data.meta.total} total` : ""}
					</span>
				</div>
			</div>

			<div className="overflow-x-auto">
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
					</div>
				) : error ? (
					<div className="flex items-center justify-center py-12">
						<p className="text-sm text-destructive">Failed to load transactions</p>
					</div>
				) : !data?.data.length ? (
					<div className="flex items-center justify-center py-12">
						<p className="text-sm text-muted-foreground">No transactions found</p>
					</div>
				) : (
					<>
						<Table>
							<TableHeader>
								<TableRow className="border-bottom border-slate-200 shadow-sm rounded-md">
									<TableHead className="text-left text-muted-foreground">
										Transaction Date
									</TableHead>
									<TableHead className="text-left text-muted-foreground">
										Transaction Type
									</TableHead>
									<TableHead className="text-right text-muted-foreground">
										Amount
									</TableHead>
									<TableHead className="text-left text-muted-foreground">
										Note
									</TableHead>
									<TableHead className="text-center text-muted-foreground">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="gap-4 [&_tr_td]:py-4">
								{data.data.map((transaction: Transaction) => {
									const typeConfig = TRANSACTION_TYPE_CONFIG[transaction.type] || {
										label: transaction.type,
										variant: "outline" as const,
									};

									return (
										<TableRow
											key={transaction.id}
											className="border-bottom border-gray-200 shadow-sm rounded-md"
										>
											<TableCell className="text-sm">
												{format(new Date(transaction.createdAt), "MMM dd, yyyy HH:mm")}
											</TableCell>
											<TableCell>
												<Badge variant={typeConfig.variant}>
													{typeConfig.label}
												</Badge>
											</TableCell>
											<TableCell className="text-right font-medium">
												{formatCurrency(transaction.amount)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground max-w-xs truncate">
												{transaction.note || "-"}
											</TableCell>
											<TableCell className="text-center">
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0"
													onClick={() => {
														// TODO: Implement edit functionality
														console.log("Edit transaction:", transaction.id);
													}}
												>
													<Pencil className="h-4 w-4" />
												</Button>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>

						{data.meta.totalPages > 1 && (
							<div className="flex items-center justify-between pt-4 border-t border-border mt-4">
								<p className="text-sm text-muted-foreground">
									Page {data.meta.page} of {data.meta.totalPages}
								</p>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={handlePreviousPage}
										disabled={!data.meta.hasPrev}
									>
										<ChevronLeft className="h-4 w-4 mr-1" />
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={handleNextPage}
										disabled={!data.meta.hasNext}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-1" />
									</Button>
								</div>
							</div>
						)}
					</>
				)}
			</div>
		</Card>
	);
}
