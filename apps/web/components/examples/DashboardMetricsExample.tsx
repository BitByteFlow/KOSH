"use client";

import { useAccountBalance, useCreateTransaction } from "@/lib/api";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";
import { useState } from "react";

export function DashboardMetricsExample() {
	const [amount, setAmount] = useState("");
	const [note, setNote] = useState("");

	const { data, isLoading, error, refetch } = useAccountBalance();

	const createTransaction = useCreateTransaction();

	const handleAddOpeningCash = async () => {
		try {
			await createTransaction.mutateAsync({
				type: "OPENING_CASH",
				amount: Number(amount),
				note: note || "Opening cash",
			});

			setAmount("");
			setNote("");

			alert("Opening cash added successfully!");
		} catch (error) {
			alert(getUserFriendlyErrorMessage(error));
		}
	};

	if (isLoading) {
		return (
			<div className="p-4 border rounded">
				<p>Loading dashboard metrics...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-4 border border-red-500 rounded bg-red-50">
				<p className="text-red-700">Error: {getUserFriendlyErrorMessage(error)}</p>
				<button
					onClick={() => refetch()}
					className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
				>
					Retry
				</button>
			</div>
		);
	}

	return (
		<div className="p-4 border rounded space-y-4">
			<h2 className="text-xl font-bold">Dashboard Metrics (React Query Example)</h2>

			{/* Display metrics */}
			<div className="grid grid-cols-2 gap-4">
				<div className="p-3 bg-blue-50 rounded">
					<p className="text-sm text-gray-600">Opening Cash</p>
					<p className="text-2xl font-bold">{data?.openingCash}</p>
				</div>
				<div className="p-3 bg-green-50 rounded">
					<p className="text-sm text-gray-600">Closing Cash</p>
					<p className="text-2xl font-bold">{data?.closingCash}</p>
				</div>
				<div className="p-3 bg-purple-50 rounded">
					<p className="text-sm text-gray-600">Total Sales</p>
					<p className="text-2xl font-bold">{data?.totalSales}</p>
				</div>
				<div className="p-3 bg-orange-50 rounded">
					<p className="text-sm text-gray-600">Total Expense</p>
					<p className="text-2xl font-bold">{data?.totalExpense}</p>
				</div>
			</div>

			{/* Add opening cash form */}
			<div className="border-t pt-4">
				<h3 className="font-semibold mb-2">Add Opening Cash</h3>
				<div className="space-y-2">
					<input
						type="number"
						value={amount}
						onChange={(e) => setAmount(e.target.value)}
						placeholder="Amount"
						className="w-full px-3 py-2 border rounded"
					/>
					<input
						type="text"
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Note (optional)"
						className="w-full px-3 py-2 border rounded"
					/>
					<button
						onClick={handleAddOpeningCash}
						disabled={!amount || createTransaction.isPending}
						className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
					>
						{createTransaction.isPending ? "Adding..." : "Add Opening Cash"}
					</button>
				</div>
			</div>
		</div>
	);
}
