"use client";

import { useMemo, useState } from "react";
import { Card } from "@kosh/ui/components/card";
import { Button } from "@kosh/ui/components/button";
import { Badge } from "@kosh/ui/components/badge";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { TransactionTableSkeleton } from "@/components/TableSkeleton";
import { gql } from "@/gql";
import { useQuery } from "@apollo/client/react";
import { parseGraphQLResponse } from "@/lib/graphql/utils";
import { AccountTransaction } from "@/gql/graphql";

const TRANSACTION_TYPE_CONFIG: Record<
	string,
	{
		label: string;
		variant: "default" | "secondary" | "destructive" | "outline";
	}
> = {
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

const GET_TRANSACTIONS = gql(`
	query GetTransactions($page: Int, $limit: Int, $sortBy: String, $sortOrder: String) {
		getAccountTransactions(page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
			success
			message
			data {
				id
				type
				amount
				note
				createdAt
				updatedAt
			}
			meta {
				total
				page
				limit
				totalPages
				hasNext
				hasPrev
			}
		}
	}
`)

const DEFAULT_TRANSACTIONS_DATA = {
	data: [] as AccountTransaction[],
	meta: {
		total: 0,
		page: 1,
		limit: 10,
		totalPages: 0,
		hasNext: false,
		hasPrev: false,
	},
};

export function TransactionTable() {
	const [page, setPage] = useState(1);
	const limit = 10;

	const { data: rawData, loading, error } = useQuery(GET_TRANSACTIONS, {
		variables: {
			page,
			limit,
			sortBy: "createdAt",
			sortOrder: "desc",
		},
	});

	const { data: transactions, meta } = useMemo(() => {
		const result = parseGraphQLResponse(rawData?.getAccountTransactions, [] as AccountTransaction[]);
		return {
			data: result.data || [],
			meta: result.meta || DEFAULT_TRANSACTIONS_DATA.meta
		};
	}, [rawData?.getAccountTransactions]);

	const handlePreviousPage = () => {
		if (meta.hasPrev) {
			setPage((prev) => prev - 1);
		}
	};

	const handleNextPage = () => {
		if (meta.hasNext) {
			setPage((prev) => prev + 1);
		}
	};

	return (
		<Card className="border border-border gap-2 p-6 overflow-hidden rounded-lg shadow-md">
			<div className="flex items-center justify-between py-2 ">
				<h2 className="text-lg font-bold">Recent Transactions</h2>
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">
						{meta.total ? `${meta.total} total` : ""}
					</span>
				</div>
			</div>

			<div className="overflow-x-auto">
				{loading ? (
					<TransactionTableSkeleton />
				) : error ? (
					<div className="flex items-center justify-center py-12">
						<p className="text-sm text-destructive">
							Failed to load transactions
						</p>
					</div>
				) : !transactions.length ? (
					<div className="flex items-center justify-center py-12">
						<p className="text-sm text-muted-foreground">
							No transactions found
						</p>
					</div>
				) : (
					<>
						<Table>
							<TableHeader className="bg-muted/50">
								<TableRow className="border-b border-border transition-colors">
									<TableHead className="text-left font-semibold text-foreground">
										Transaction Date
									</TableHead>
									<TableHead className="text-left font-semibold text-foreground">
										Transaction Type
									</TableHead>
									<TableHead className="text-right font-semibold text-foreground">
										Amount
									</TableHead>
									<TableHead className="text-left font-semibold text-foreground">
										Note
									</TableHead>
									<TableHead className="text-center font-semibold text-foreground">
										Actions
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="[&_tr_td]:py-4">
								{transactions.map((transaction) => {
									const typeConfig = TRANSACTION_TYPE_CONFIG[
										transaction.type
									] || {
										label: transaction.type,
										variant: "outline" as const,
									};

									return (
										<TableRow
											key={transaction.id}
											className="border-b border-border/50 hover:bg-muted/30 transition-colors"
										>
											<TableCell className="text-sm">
												{format(
													new Date(transaction.createdAt),
													"MMM dd, yyyy HH:mm",
												)}
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

						{meta.totalPages > 1 && (
							<div className="flex items-center justify-between pt-4 border-t border-border mt-4">
								<p className="text-sm text-muted-foreground">
									Page {meta.page} of {meta.totalPages}
								</p>
								<div className="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={handlePreviousPage}
										disabled={!meta.hasPrev}
									>
										<ChevronLeft className="h-4 w-4 mr-1" />
										Previous
									</Button>
									<Button
										variant="outline"
										size="sm"
										onClick={handleNextPage}
										disabled={!meta.hasNext}
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
