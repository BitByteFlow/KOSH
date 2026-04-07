import React from "react";
import { format } from "date-fns";
import {
	Banknote,
	CreditCard,
	History,
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
import { Badge } from "@kosh/ui/components/badge";
import type { Transaction } from "../../types/transactions";

interface TransactionsTableProps {
	transactions: Transaction[];
	onTransactionClick?: (transaction: Transaction) => void;
}

const PAYMENT_TYPE_CONFIG = {
	CASH: {
		icon: Banknote,
		color: "text-green-500",
		label: "CASH",
	},
	ONLINE: {
		icon: CreditCard,
		color: "text-blue-500",
		label: "ONLINE",
	},
	CREDIT: {
		icon: History,
		color: "text-orange-500",
		label: "CREDIT",
	},
} as const;

const TransactionRow = React.memo(
	({
		transaction,
		onTransactionClick,
	}: {
		transaction: Transaction;
		onTransactionClick?: (transaction: Transaction) => void;
	}) => {
		const PaymentIcon = PAYMENT_TYPE_CONFIG[transaction.paymentType].icon;
		const paymentColor = PAYMENT_TYPE_CONFIG[transaction.paymentType].color;

		return (
			<TableRow
				className="group border-slate-50 hover:bg-slate-50/50 transition-colors cursor-pointer"
				onClick={() => onTransactionClick?.(transaction)}
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onTransactionClick?.(transaction);
					}
				}}
				role="row"
				aria-label={`Transaction ${transaction.id.slice(0, 8)} for Rs. ${transaction.total.toFixed(2)}`}
			>
				<TableCell className="py-4 pl-6">
					<span className="font-mono text-xs font-bold text-slate-500 group-hover:text-primary transition-colors uppercase">
						#{transaction.id.slice(0, 8)}
					</span>
				</TableCell>
				<TableCell>
					<div className="flex flex-col">
						<span className="font-bold text-slate-700 text-sm">
							{format(new Date(transaction.createdAt), "MMM dd, yyyy")}
						</span>
						<span className="text-[10px] text-slate-400 font-medium">
							{format(new Date(transaction.createdAt), "hh:mm a")}
						</span>
					</div>
				</TableCell>
				<TableCell className="p-0">
					<Badge
						variant="outline"
						className="bg-white border-slate-100 text-slate-500 font-bold"
					>
						{transaction.items?.length || 0} items
					</Badge>
				</TableCell>
				<TableCell>
					<div className="flex items-center gap-2">
						<PaymentIcon size={14} className={paymentColor} />
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
								aria-hidden="true"
							/>
						</div>
					</div>
				</TableCell>
			</TableRow>
		);
	},
);

TransactionRow.displayName = "TransactionRow";

export const TransactionsTable: React.FC<TransactionsTableProps> = React.memo(
	({ transactions, onTransactionClick }) => {
		if (!transactions?.length) {
			return null;
		}

		return (
			<Table role="grid" aria-label="Transactions list">
				<TableHeader className="bg-slate-50/50">
					<TableRow className="hover:bg-transparent border-slate-100">
						<TableHead
							className="font-bold text-xs uppercase tracking-wider text-slate-400 py-4 pl-6"
							scope="col"
						>
							ID
						</TableHead>
						<TableHead
							className="font-bold text-xs uppercase tracking-wider text-slate-400"
							scope="col"
						>
							Date & Time
						</TableHead>
						<TableHead
							className="font-bold text-xs uppercase tracking-wider text-slate-400"
							scope="col"
						>
							Items
						</TableHead>
						<TableHead
							className="font-bold text-xs uppercase tracking-wider text-slate-400"
							scope="col"
						>
							Method
						</TableHead>
						<TableHead
							className="font-bold text-xs uppercase tracking-wider text-slate-400 pr-6"
							scope="col"
						>
							Amount
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{transactions.map((transaction) => (
						<TransactionRow
							key={transaction.id}
							transaction={transaction}
							onTransactionClick={onTransactionClick}
						/>
					))}
				</TableBody>
			</Table>
		);
	},
);

TransactionsTable.displayName = "TransactionsTable";

export default TransactionsTable;
