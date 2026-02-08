"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
	DialogFooter,
} from "@kosh/ui/components/dialog";
import { Button } from "@kosh/ui/components/button";
import { Input } from "@kosh/ui/components/input";
import { addOpeningCash } from "@/actions/transaction.actions";

const TRANSACTION_TYPES = [
	{ value: "INITIAL_CAPITAL", label: "Initial Capital" },
	{ value: "ADDITIONAL_CAPITAL", label: "Additional Capital" },
	{ value: "SALE_INCOME", label: "Sale Income" },
	{ value: "CREDIT_RECEIVED", label: "Credit Received" },
] as const;

export const OpeningCashModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [note, setNote] = useState("");
	const [type, setType] = useState<string>("INITIAL_CAPITAL");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		const amountValue = parseFloat(amount);
		if (isNaN(amountValue) || amountValue <= 0) {
			setError("Please enter a valid positive amount.");
			setIsLoading(false);
			return;
		}

		const result = await addOpeningCash({ amount: amountValue, note, type });

		if (result.success) {
			setIsOpen(false);
			setAmount("");
			setNote("");
			setType("INITIAL_CAPITAL");
		} else {
			setError(result.message);
		}

		setIsLoading(false);
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					Add Cash
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Cash</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4 py-4">
					{error && <p className="text-red-500 text-sm">{error}</p>}
					<div className="grid gap-2">
						<label htmlFor="type" className="text-sm font-medium leading-none">
							Transaction Type
						</label>
						<select
							id="type"
							value={type}
							onChange={(e) => setType(e.target.value)}
							disabled={isLoading}
							className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						>
							{TRANSACTION_TYPES.map((t) => (
								<option key={t.value} value={t.value}>
									{t.label}
								</option>
							))}
						</select>
					</div>
					<div className="grid gap-2">
						<label htmlFor="amount" className="text-sm font-medium leading-none">
							Amount
						</label>
						<Input
							id="amount"
							type="number"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="0.00"
							disabled={isLoading}
						/>
					</div>
					<div className="grid gap-2">
						<label htmlFor="note" className="text-sm font-medium leading-none">
							Note (Optional)
						</label>
						<Input
							id="note"
							value={note}
							onChange={(e) => setNote(e.target.value)}
							placeholder="Description"
							disabled={isLoading}
						/>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Adding..." : "Confirm"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
