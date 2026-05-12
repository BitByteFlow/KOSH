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
import { useQuery, useMutation } from "@apollo/client/react";
import { GET_ACCOUNT_TRANSACTIONS } from "@/services/account.service";
import { parseGraphQLResponse } from "@/lib/graphql/utils";
import { AccountTransaction, PaginatedTransactionsResponse } from "@/gql/graphql";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@kosh/ui/components/dialog";
import { Label } from "@kosh/ui/components/label";
import { Input } from "@kosh/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@kosh/ui/components/select";
import { toast } from "sonner";

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
	CREDIT: { label: "Credit", variant: "destructive" },
};

const UPDATE_ACCOUNT_TRANSACTION = gql(`
	mutation UpdateAccountTransactions($transactionId: String!, $updateTransactionInput: UpdateTransactionInput!) {
		updateAccountTransactions(transactionId: $transactionId, updateTransactionInput: $updateTransactionInput) {
			success
			message
			data {
				id
				type
				amount
				note
				updatedAt
			}
		}
	}
`);

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

	const [editingTransaction, setEditingTransaction] =
		useState<AccountTransaction | null>(null);
	const [editFormState, setEditFormState] = useState({
		amount: 0,
		note: "",
		type: "",
	});

	const {
		data: rawData,
		loading,
		error,
	} = useQuery<{ getAccountTransactions: PaginatedTransactionsResponse }>(GET_ACCOUNT_TRANSACTIONS, {
		variables: {
			page,
			limit,
			sortBy: "createdAt",
			sortOrder: "desc",
		},
	});

	const { data: transactions, meta } = useMemo(() => {
		const result = parseGraphQLResponse(
			rawData?.getAccountTransactions,
			[] as AccountTransaction[],
		);
		return {
			data: result.data || [],
			meta: result.meta || DEFAULT_TRANSACTIONS_DATA.meta,
		};
	}, [rawData?.getAccountTransactions]);

	const [updateTransaction, { loading: updating }] = useMutation(
		UPDATE_ACCOUNT_TRANSACTION,
	);

	const handleEditClick = (transaction: AccountTransaction) => {
		setEditingTransaction(transaction);
		setEditFormState({
			amount: transaction.amount,
			note: transaction.note || "",
			type: transaction.type,
		});
	};

	const handleUpdateSubmit = async () => {
		if (!editingTransaction) return;
		try {
			const { data } = await updateTransaction({
				variables: {
					transactionId: editingTransaction.id,
					updateTransactionInput: {
						amount: parseFloat(editFormState.amount.toString()),
						note: editFormState.note,
						type: editFormState.type,
					},
				},
			});

			if (data?.updateAccountTransactions?.success) {
				toast.success(
					data.updateAccountTransactions.message || "Updated successfully",
				);
				setEditingTransaction(null);
			} else {
				toast.error(
					data?.updateAccountTransactions?.message || "Failed to update",
				);
			}
		} catch (error) {
			toast.error("An error occurred");
		}
	};

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
		<Card className="bg-gray-100/60 border border-border gap-2 p-6 overflow-hidden rounded-lg shadow-md">
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
									<TableHead className="text-left text-sm font-semibold text-foreground">
										Transaction Date
									</TableHead>
									<TableHead className="text-left text-sm font-semibold text-foreground">
										Transaction Type
									</TableHead>
									<TableHead className="text-right text-sm font-semibold text-foreground">
										Amount
									</TableHead>
									<TableHead className="text-left text-sm font-semibold text-foreground">
										Note
									</TableHead>
									<TableHead className="text-left text-sm font-semibold text-foreground">
										Created At
									</TableHead>
									<TableHead className="text-left text-sm font-semibold text-foreground">
										Updated At
									</TableHead>
									<TableHead className="text-center text-sm font-semibold text-foreground">
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
											className="border-b border-border/50 transition-colors hover:bg-blue-100 rounded-lg"
										>
											<TableCell>
												{format(
													new Date(transaction.createdAt),
													"MMM dd, yyyy HH:mm",
												)}
											</TableCell>
											<TableCell>
												<Badge
													variant={typeConfig.variant}
													className="px-4 py-2 text-md"
												>
													{typeConfig.label}
												</Badge>
											</TableCell>
											<TableCell className="text-right font-medium">
												{formatCurrency(transaction.amount)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground max-w-xs truncate">
												{transaction.note || "-"}
											</TableCell>

											<TableCell className="text-sm text-muted-foreground">
												{format(
													new Date(transaction.createdAt),
													"MMM dd, yyyy HH:mm",
												)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{format(
													new Date(transaction.updatedAt),
													"MMM dd, yyyy HH:mm",
												)}
											</TableCell>
											<TableCell className="text-center">
												<Button
													variant="ghost"
													size="sm"
													className="h-8 w-8 p-0"
													onClick={() => handleEditClick(transaction)}
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

			<Dialog
				open={!!editingTransaction}
				onOpenChange={(open) => !open && setEditingTransaction(null)}
			>
				<DialogContent className="sm:max-w-106.25">
					<DialogHeader>
						<DialogTitle>Edit Transaction</DialogTitle>
						<DialogDescription>
							Make changes to the selected transaction here.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="type">Transaction Type</Label>
							<Select
								value={editFormState.type}
								onValueChange={(value) =>
									setEditFormState({ ...editFormState, type: value })
								}
							>
								<SelectTrigger id="type">
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(TRANSACTION_TYPE_CONFIG).map(
										([key, config]) => (
											<SelectItem
												key={key}
												value={key}
											>
												{config.label}
											</SelectItem>
										),
									)}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="amount">Amount</Label>
							<Input
								id="amount"
								type="number"
								value={editFormState.amount}
								onChange={(e) =>
									setEditFormState({
										...editFormState,
										amount: Number(e.target.value),
									})
								}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="note">Note</Label>
							<Input
								id="note"
								value={editFormState.note}
								onChange={(e) =>
									setEditFormState({ ...editFormState, note: e.target.value })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditingTransaction(null)}
							disabled={updating}
						>
							Cancel
						</Button>
						<Button
							onClick={handleUpdateSubmit}
							disabled={updating}
						>
							{updating ? "Saving..." : "Save changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</Card>
	);
}
