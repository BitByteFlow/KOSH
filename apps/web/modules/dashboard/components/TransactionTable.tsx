"use client";

import { Card } from "@kosh/ui/components/card";
import { Button } from "@kosh/ui/components/button";
import { Filter } from "lucide-react";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@kosh/ui/components/table";

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
		<Card className="border border-border gap-2 p-6 overflow-hidden rounded-lg shadow-md">
			<div className="flex items-center justify-between py-2 border-b border-border">
				<h2 className="text-lg font-bold">Recent Transactions</h2>
				<div>
					<Filter className="w-4 h-4" />
				</div>
			</div>

			<div className="overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow className="border-bottom border-slate-200 shadow-sm rounded-md">
							<TableHead className="text-left w-45 text-muted-foreground">
								Transaction Date
							</TableHead>
							<TableHead className="text-left text-muted-foreground">
								Customer Name
							</TableHead>
							<TableHead className="text-left text-muted-foreground">
								Product Name
							</TableHead>
							<TableHead className="text-left text-muted-foreground">
								Price
							</TableHead>
							<TableHead className="text-left text-muted-foreground">
								Quantity
							</TableHead>
							<TableHead className="text-left text-muted-foreground">
								Total Price
							</TableHead>
							<TableHead className="text-left text-muted-foreground">
								Cashier
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody className="gap-4 [&_tr_td]:py-8">
						{transactions.map((transaction) => (
							<TableRow
								key={transaction.id}
								className="border-bottom border-gray-200 shadow-sm rounded-md"
							>
								<TableCell>{transaction.date}</TableCell>
								<TableCell>
									<span className="font-medium">
										{transaction.customerName}
									</span>
								</TableCell>
								<TableCell>{transaction.productName}</TableCell>
								<TableCell>${transaction.price.toFixed(2)}</TableCell>
								<TableCell>{transaction.quantity}</TableCell>
								<TableCell className="font-medium">
									${transaction.total.toFixed(2)}
								</TableCell>
								<TableCell>
									<span>{transaction.cashier}</span>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</Card>
	);
}
