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
import { cn } from "@/lib/utils";

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
	const getPaymentVariant = (
		type: string
	): "default" | "secondary" | "outline" | "destructive" => {
		switch (type) {
			case "Online":
				return "default";
			case "Cash":
				return "secondary";
			case "Credit":
				return "outline";
			default:
				return "outline";
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Search transactions..."
						className="w-full pl-10"
					/>
				</div>
				<div className="flex gap-2">
					<Button
						variant="outline"
						className="flex items-center gap-2"
					>
						<SlidersHorizontal className="h-4 w-4" />
						Filter
					</Button>
					<Button
						variant="outline"
						className="flex items-center gap-2"
					>
						<Upload className="h-4 w-4" />
						Export
					</Button>
				</div>
			</div>

			<div className="overflow-x-auto rounded-lg border border-border">
				<Table>
					<TableHeader className="bg-gray-100">
						<TableRow className="border-border">
							<TableHead>TRANSACTION ID</TableHead>
							<TableHead>DATE & TIME</TableHead>
							<TableHead>PAYMENT TYPE</TableHead>
							<TableHead>AMOUNT</TableHead>
							<TableHead>PROFIT</TableHead>
							<TableHead>STATUS</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{transactions.map((transaction) => (
							<TableRow
								key={transaction.id}
								className="hover:bg-muted/50 border-border [&_td]:py-6"
							>
								<TableCell className="font-medium">{transaction.id}</TableCell>
								<TableCell className="text-muted-foreground">
									{transaction.date} {transaction.time}
								</TableCell>
								<TableCell>
									<Badge variant={getPaymentVariant(transaction.paymentType)}>
										{transaction.paymentType}
									</Badge>
								</TableCell>
								<TableCell className="font-medium">
									{transaction.amount}
								</TableCell>
								<TableCell
									className={cn(
										"font-medium",
										transaction.profit.startsWith("-")
											? "text-red-600"
											: "text-green-600"
									)}
								>
									{transaction.profit}
								</TableCell>
								<TableCell
									className={cn(
										"font-medium",
										transaction.status === "Completed"
											? "text-green-600"
											: "text-orange-600"
									)}
								>
									{transaction.status}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
