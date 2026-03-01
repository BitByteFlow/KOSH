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
// import { useCreateTransaction } from "../hooks/useAccount";
import type { TransactionType } from "@/types/transcation";
import { useState } from "react";
import { gql } from "@/gql";
import { useMutation } from "@apollo/client/react";
import { toast } from "sonner";

const TRANSACTION_TYPES = [
	{ value: "INITIAL_CAPITAL" as TransactionType, label: "Initial Capital" },
	{ value: "ADDITIONAL_CAPITAL" as TransactionType, label: "Additional Capital" },
	{ value: "SALE_INCOME" as TransactionType, label: "Sale Income" },
	{ value: "CREDIT_RECEIVED" as TransactionType, label: "Credit Received" },
] as const;

interface FormData {
	type: TransactionType;
	amount: string;
	note: string;
}

const CREATE_TRANSACTION = gql(`
	mutation CreateTransaction($createTransactionInput: CreateTransactionInput!) {
		createTransaction(createTransactionInput: $createTransactionInput) {
			success
			data {
				id
				type
				amount
				note
				createdAt
				updatedAt
			}
		}
	}
`);

export const OpeningCashModal = () => {
	const [isOpen, setIsOpen] = useState(false);
	// const createTransaction = useCreateTransaction();
	const [createTransactionMutation, { loading, error }] = useMutation(CREATE_TRANSACTION)

	const {
		register,
		handleSubmit,
		control,
		reset,
		formState: { isSubmitting },
	} = useForm<FormData>({
		defaultValues: {
			type: "INITIAL_CAPITAL",
			amount: "",
			note: "",
		},
	});

	const onSubmit = async (data: FormData) => {
		const amountValue = parseFloat(data.amount);
		if (isNaN(amountValue) || amountValue <= 0) {
			return;
		}
		const { data: transactionResponse, error } = await createTransactionMutation({
			variables: {
				createTransactionInput: {
					amount: amountValue,
					note: data.note,
					type: data.type,
				}
			}
		})
		if (!error && transactionResponse?.createTransaction?.success) {
			toast.success("Transaction created successfully");
			setIsOpen(false);
			reset();
		} else {
			toast.error(error?.message || "Transaction failed");
		}
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
							{isSubmitting ? "Adding..." : "Confirm"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
