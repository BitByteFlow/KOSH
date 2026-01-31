import { Search } from "lucide-react";

interface Transaction {
	id: string;
	date: string;
	time: string;
	paymentType: "Online" | "Cash" | "Credit";
	amount: string;
	profit: string;
	status: "Completed" | "Pending";
}

interface AnalyticsTransactionTableProps {
	transactions: Transaction[];
}

export function AnalyticsTransactionTable({
	transactions,
}: AnalyticsTransactionTableProps) {
	const getPaymentTypeColor = (type: string) => {
		switch (type) {
			case "Online":
				return "bg-blue-100 text-blue-700";
			case "Cash":
				return "bg-green-100 text-green-700";
			case "Credit":
				return "bg-orange-100 text-orange-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Completed":
				return "text-green-600";
			case "Pending":
				return "text-orange-600";
			default:
				return "text-gray-600";
		}
	};

	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<div className="mb-6 flex items-center justify-between">
				<div className="relative flex-1 max-w-md">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						placeholder="Search transactions..."
						className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
					/>
				</div>
				<div className="flex gap-2">
					<button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
						Filter
					</button>
					<button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
						Export
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border">
							<th className="px-4 py-3 text-left font-semibold text-foreground">
								TRANSACTION ID
							</th>
							<th className="px-4 py-3 text-left font-semibold text-foreground">
								DATE & TIME
							</th>
							<th className="px-4 py-3 text-left font-semibold text-foreground">
								PAYMENT TYPE
							</th>
							<th className="px-4 py-3 text-left font-semibold text-foreground">
								AMOUNT
							</th>
							<th className="px-4 py-3 text-left font-semibold text-foreground">
								PROFIT
							</th>
							<th className="px-4 py-3 text-left font-semibold text-foreground">
								STATUS
							</th>
						</tr>
					</thead>
					<tbody>
						{transactions.map((transaction) => (
							<tr
								key={transaction.id}
								className="border-b border-border hover:bg-muted/50"
							>
								<td className="px-4 py-3 font-medium text-foreground">
									{transaction.id}
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									{transaction.date} {transaction.time}
								</td>
								<td className="px-4 py-3">
									<span
										className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getPaymentTypeColor(transaction.paymentType)}`}
									>
										{transaction.paymentType}
									</span>
								</td>
								<td className="px-4 py-3 font-medium text-foreground">
									{transaction.amount}
								</td>
								<td
									className={`px-4 py-3 font-medium ${transaction.profit.startsWith("-") ? "text-red-600" : "text-green-600"}`}
								>
									{transaction.profit}
								</td>
								<td
									className={`px-4 py-3 font-medium ${getStatusColor(transaction.status)}`}
								>
									{transaction.status}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
