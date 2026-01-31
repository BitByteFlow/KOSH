"use client";

import { Card } from "@kosh/ui/components/card";
import { Button } from "@kosh/ui/components/button";
import { Filter } from "lucide-react";

interface Transaction {
	id: string;
	date: string;
	customerName: string;
	initials: string;
	bg: string;
	productName: string;
	price: number;
	quantity: number;
	total: number;
	cashier: string;
	cashierInitials: string;
	cashierBg: string;
}

interface TransactionTableProps {
	transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
	return (
		<Card className="border border-border p-0 overflow-hidden">
			<div className="flex items-center justify-between p-6 border-b border-border">
				<h2 className="text-lg font-bold">Recent Transactions</h2>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="gap-2 bg-transparent"
					>
						<Filter className="w-4 h-4" />
						Filter
					</Button>
					<Button
						variant="outline"
						size="sm"
					>
						Monthly
					</Button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border bg-muted/50">
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Transaction Date
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Customer Name
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Product Name
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Price
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Quantity
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Total Price
							</th>
							<th className="text-left px-6 py-3 font-semibold text-muted-foreground">
								Cashier
							</th>
						</tr>
					</thead>
					<tbody>
						{transactions.map((transaction, i) => (
							<tr
								key={transaction.id}
								className={`border-b border-border ${i === 0 ? "bg-red-50/50 dark:bg-red-950/20" : ""}`}
							>
								<td className="px-6 py-4">{transaction.date}</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<div
											className={`w-6 h-6 ${transaction.bg} rounded text-xs font-medium flex items-center justify-center text-white`}
										>
											{transaction.initials}
										</div>
										<span className="font-medium">
											{transaction.customerName}
										</span>
									</div>
								</td>
								<td className="px-6 py-4">{transaction.productName}</td>
								<td className="px-6 py-4">${transaction.price}</td>
								<td className="px-6 py-4">{transaction.quantity}</td>
								<td className="px-6 py-4 font-medium">${transaction.total}</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<div
											className={`w-6 h-6 ${transaction.cashierBg} rounded text-xs font-medium flex items-center justify-center text-white`}
										>
											{transaction.cashierInitials}
										</div>
										<span>{transaction.cashier}</span>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</Card>
	);
}
