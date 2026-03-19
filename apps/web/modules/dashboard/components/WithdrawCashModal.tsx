"use client";

import { useForm, Controller } from "react-hook-form";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@kosh/ui/components/select";
import { useCreateTransaction } from "../hooks/useAccount";
import { useState } from "react";

const TRANSACTION_TYPES = [
	{ value: "WITHDRAWAL", label: "Withdrawal" },
	{ value: "EXPENSES", label: "Expenses" },
	{ value: "DEBT_PAID", label: "Debt Paid" },
	{ value: "DEBT", label: "Debt" },
] as const;

interface FormData {
	type: string;
	amount: string;
	note: string;
}

export const WithdrawCashModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [createTransaction, { loading }] = useCreateTransaction();

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { isSubmitting },
	} = useForm<FormData>({
		defaultValues: {
			type: "WITHDRAWAL",
			amount: "",
			note: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		const amountValue = parseFloat(data.amount);
		if (isNaN(amountValue) || amountValue <= 0) {
			return;
		}

		const result = await createTransaction({
			variables: {
				input: {
					amount: amountValue,
					note: data.note,
					type: data.type as any,
				},
			},
		});

		if (result.data?.createTransaction?.success) {
			setIsOpen(false);
			reset();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button size="lg" variant="secondary" className="text-base hover rounded-xl shadow-lg shadow-secondary/20 transition-all hover:scale-105 active:scale-95 hover:cursor-pointer">
					Withdraw Cash
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Withdraw Cash / Expenses</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
					<div className="grid gap-2">
						<label htmlFor="type" className="text-sm font-medium leading-none">
							Transaction Type
						</label>
						<Controller
							name="type"
							control={control}
							render={({ field }) => (
								<Select
									value={field.value}
									onValueChange={field.onChange}
									disabled={isSubmitting}
								>
									<SelectTrigger className="w-full">
										<SelectValue placeholder="Select type" />
									</SelectTrigger>
									<SelectContent>
										{TRANSACTION_TYPES.map((t) => (
											<SelectItem key={t.value} value={t.value}>
												{t.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						/>
					</div>
					<div className="grid gap-2">
						<label htmlFor="amount" className="text-sm font-medium leading-none">
							Amount
						</label>
						<Input
							id="amount"
							type="number"
							step="0.01"
							placeholder="0.00"
							disabled={isSubmitting}
							{...register("amount", { required: true, min: 0.01 })}
						/>
					</div>
					<div className="grid gap-2">
						<label htmlFor="note" className="text-sm font-medium leading-none">
							Note (Optional)
						</label>
						<Input
							id="note"
							placeholder="Description"
							disabled={isSubmitting}
							{...register("note")}
						/>
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Processing..." : "Confirm"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
