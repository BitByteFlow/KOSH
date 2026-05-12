"use client";

import { useForm, Controller } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
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
	{ value: "INITIAL_CAPITAL", label: "Initial Capital" },
	{ value: "ADDITIONAL_CAPITAL", label: "Additional Capital" },
	{ value: "SALE_INCOME", label: "Sale Income" },
	{ value: "CREDIT_RECEIVED", label: "Credit Received" },
] as const;

interface FormData {
	type: string;
	amount: string;
	note: string;
}

export const OpeningCashModal = () => {
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

		const result = await createTransaction({
			variables: {
				input: {
					amount: amountValue,
					note: data.note,
					type: data.type as any,
				}
			}
		});

		if (result.data?.createTransaction?.success) {
			setIsOpen(false);
			reset();
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={setIsOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="text-sm hover rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 hover:cursor-pointer">
					Add Cash
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-106.5">
				<DialogHeader>
					<DialogTitle className="text-xl tracking-tighter">Add Cash</DialogTitle>
					<DialogDescription>
						Add cash to your business account
					</DialogDescription>
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
									<SelectContent className="text-sm">
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
							className="h-12 text-sm"
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
							className="h-12 text-sm"
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
