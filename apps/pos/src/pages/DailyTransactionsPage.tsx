import React, { useState } from "react";
import {
	useAllTransactions,
	useCreateTransaction,
} from "../hooks/useTransactions";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
	TrendingUp,
	TrendingDown,
	DollarSign,
	Plus,
	Minus,
	Wallet,
	ShoppingBag,
	RefreshCw,
	Clock,
	ChevronUp,
	ArrowDownLeft,
	ArrowUpRight,
	AlertCircle,
} from "lucide-react";
import { Button } from "@kosh/ui/components/button";
import { Card, CardContent, CardHeader } from "@kosh/ui/components/card";
import { Badge } from "@kosh/ui/components/badge";
import { Input } from "@kosh/ui/components/input";
import { toast } from "sonner";
import type { TransactionType } from "@/types";

const TRANSACTION_TYPES = [
	{
		value: "WITHDRAWAL",
		label: "Withdrawal",
		icon: ArrowUpRight,
		color: "text-red-500",
		bgColor: "bg-red-50",
		badgeClass: "bg-red-100 text-red-700 border-red-200",
	},
	{
		value: "EXPENSES",
		label: "Expense",
		icon: Minus,
		color: "text-orange-500",
		bgColor: "bg-orange-50",
		badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
	},
	{
		value: "ADDITIONAL_CAPITAL",
		label: "Cash In",
		icon: ArrowDownLeft,
		color: "text-green-500",
		bgColor: "bg-green-50",
		badgeClass: "bg-green-100 text-green-700 border-green-200",
	},
	{
		value: "DEBT_PAID",
		label: "Debt Paid",
		icon: TrendingUp,
		color: "text-blue-500",
		bgColor: "bg-blue-50",
		badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
	},
	{
		value: "ADJUSTMENT",
		label: "Adjustment",
		icon: RefreshCw,
		color: "text-purple-500",
		bgColor: "bg-purple-50",
		badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
	},
] as const;

const getTypeConfig = (type: string) =>
	TRANSACTION_TYPES.find((t) => t.value === type) ?? {
		value: type,
		label: type,
		icon: DollarSign,
		color: "text-slate-500",
		bgColor: "bg-slate-50",
		badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
	};

const isDebit = (type: string) =>
	["WITHDRAWAL", "EXPENSES", "PURCHASE", "DEBT"].includes(type);

interface AddEntryFormProps {
	onSuccess: () => void;
	onCancel: () => void;
}

const AddEntryForm: React.FC<AddEntryFormProps> = ({ onSuccess, onCancel }) => {
	const [selectedType, setSelectedType] = useState<TransactionType>(
		"EXPENSES" as TransactionType,
	);
	const [amount, setAmount] = useState("");
	const [note, setNote] = useState("");

	const createTransaction = useCreateTransaction();
	const isLoading = createTransaction.isPending;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const parsedAmount = parseFloat(amount);
		if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
			toast.error("Please enter a valid amount greater than 0.");
			return;
		}
		try {
			await createTransaction.mutateAsync({
				type: selectedType,
				amount: parsedAmount,
				note: note.trim() || undefined,
				storeId: "", // Will be handled by backend from auth token
			});
			onSuccess();
		} catch (err) {}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 10 }}
		>
			<Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
				<CardHeader className="bg-slate-50 border-b border-slate-100 py-4 px-6">
					<h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">
						New Transaction Entry
					</h3>
				</CardHeader>
				<CardContent className="p-6">
					<form
						onSubmit={handleSubmit}
						className="space-y-5"
					>
						<div>
							<span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
								Transaction Type
							</span>
							<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
								{TRANSACTION_TYPES.map(
									({ value, label, icon: Icon, color, bgColor }) => (
										<button
											key={value}
											type="button"
											onClick={() => setSelectedType(value as TransactionType)}
											className={`flex items-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
												selectedType === value
													? `border-primary bg-primary/5 text-primary`
													: `border-slate-200 bg-white text-slate-500 hover:border-slate-300`
											}`}
										>
											<div
												className={`p-1 rounded-lg ${selectedType === value ? "bg-primary/10" : bgColor}`}
											>
												<Icon
													size={14}
													className={
														selectedType === value ? "text-primary" : color
													}
												/>
											</div>
											<span className="text-xs">{label}</span>
										</button>
									),
								)}
							</div>
						</div>

						<div>
							<span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
								Amount
							</span>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
									$
								</span>
								<Input
									type="number"
									min="0.01"
									step="0.01"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="0.00"
									className="pl-9 h-12 rounded-xl border-slate-200 font-mono text-lg font-bold"
									required
								/>
							</div>
						</div>

						<div>
							<span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
								Note (Optional)
							</span>
							<Input
								value={note}
								onChange={(e) => setNote(e.target.value)}
								placeholder="e.g. Office supplies, petty cash withdrawal..."
								className="h-12 rounded-xl border-slate-200"
								maxLength={200}
							/>
						</div>

						<div className="flex gap-3 pt-1">
							<Button
								type="submit"
								disabled={isLoading}
								className="flex-1 h-12 rounded-xl font-bold gap-2"
							>
								{isLoading ? (
									<RefreshCw
										size={16}
										className="animate-spin"
									/>
								) : (
									<Plus size={16} />
								)}
								{isLoading ? "Saving..." : "Record Transaction"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={onCancel}
								className="h-12 px-6 rounded-xl border-slate-200 font-bold text-slate-500"
							>
								Cancel
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</motion.div>
	);
};

const DailyTransactionsPage: React.FC = () => {
	const [showAddForm, setShowAddForm] = useState(false);
	const { data, isLoading: loading, error, refetch } = useAllTransactions();
	console.log("this is transaction data:", data);

	const transactions = data ?? [];
	const today = format(new Date(), "yyyy-MM-dd");
	const todayTransactions = transactions.filter(
		(t) => format(new Date(t.createdAt), "yyyy-MM-dd") === today,
	);

	const totalCashIn = todayTransactions
		.filter((t) => !isDebit(t.type))
		.reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);

	const totalCashOut = todayTransactions
		.filter((t) => isDebit(t.type))
		.reduce((acc, t) => acc + parseFloat(t.amount.toString()), 0);

	const netBalance = totalCashIn - totalCashOut;

	const handleSuccess = () => {
		setShowAddForm(false);
		refetch();
	};

	if (error)
		return (
			<div className="p-8 h-full flex items-center justify-center">
				<div className="flex flex-col items-center gap-3 text-center">
					<AlertCircle
						className="text-red-400"
						size={40}
					/>
					<p className="font-bold text-slate-700">
						Failed to load transactions
					</p>
					<p className="text-sm text-slate-400">{(error as Error).message}</p>
					<Button
						variant="outline"
						onClick={() => refetch()}
						className="mt-2"
					>
						Try Again
					</Button>
				</div>
			</div>
		);

	return (
		<div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div>
					<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
						{format(new Date(), "EEEE, MMMM d, yyyy")}
					</p>
					<h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
						DAILY LEDGER
					</h1>
					<p className="text-slate-500 font-medium mt-1">
						Record and track today's cash movements.
					</p>
				</div>
				<Button
					onClick={() => setShowAddForm((v) => !v)}
					className={`h-11 px-6 rounded-xl font-bold gap-2 transition-all ${showAddForm ? "bg-slate-200 text-slate-700 hover:bg-slate-300" : ""}`}
					variant={showAddForm ? "ghost" : "default"}
				>
					{showAddForm ? <ChevronUp size={16} /> : <Plus size={16} />}
					{showAddForm ? "Cancel" : "Add Entry"}
				</Button>
			</div>

			<div className="grid grid-cols-3 gap-4">
				<Card className="rounded-2xl border-0 bg-linear-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/20">
					<CardContent className="p-5">
						<div className="flex items-center justify-between mb-3">
							<div className="p-2 bg-white/20 rounded-xl">
								<TrendingUp
									size={18}
									className="text-white"
								/>
							</div>
							<span className="text-white/70 text-[10px] font-black uppercase tracking-wider">
								Cash In
							</span>
						</div>
						<p className="text-white text-2xl font-black">
							${totalCashIn.toFixed(2)}
						</p>
					</CardContent>
				</Card>

				<Card className="rounded-2xl border-0 bg-linear-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/20">
					<CardContent className="p-5">
						<div className="flex items-center justify-between mb-3">
							<div className="p-2 bg-white/20 rounded-xl">
								<TrendingDown
									size={18}
									className="text-white"
								/>
							</div>
							<span className="text-white/70 text-[10px] font-black uppercase tracking-wider">
								Cash Out
							</span>
						</div>
						<p className="text-white text-2xl font-black">
							${totalCashOut.toFixed(2)}
						</p>
					</CardContent>
				</Card>

				<Card
					className={`rounded-2xl border-0 shadow-lg ${netBalance >= 0 ? "bg-linear-to-br from-blue-500 to-indigo-600 shadow-blue-500/20" : "bg-linear-to-br from-slate-500 to-slate-700 shadow-slate-500/20"}`}
				>
					<CardContent className="p-5">
						<div className="flex items-center justify-between mb-3">
							<div className="p-2 bg-white/20 rounded-xl">
								<Wallet
									size={18}
									className="text-white"
								/>
							</div>
							<span className="text-white/70 text-[10px] font-black uppercase tracking-wider">
								Net
							</span>
						</div>
						<p className="text-white text-2xl font-black">
							{netBalance >= 0 ? "+" : ""}
							{netBalance.toFixed(2)}
						</p>
					</CardContent>
				</Card>
			</div>

			<AnimatePresence>
				{showAddForm && (
					<AddEntryForm
						onSuccess={handleSuccess}
						onCancel={() => setShowAddForm(false)}
					/>
				)}
			</AnimatePresence>

			<div className="space-y-3">
				<div className="flex items-center gap-3">
					<h2 className="font-black text-slate-800 uppercase tracking-tighter text-sm">
						Today's Entries
					</h2>
					<div className="h-px flex-1 bg-slate-200" />
					<Badge
						variant="outline"
						className="text-[10px] font-black px-2 border-slate-200 text-slate-400"
					>
						{todayTransactions.length} records
					</Badge>
				</div>

				{loading && !data && (
					<div className="flex items-center justify-center py-16">
						<RefreshCw
							className="animate-spin text-slate-300"
							size={32}
						/>
					</div>
				)}

				{!loading && todayTransactions.length === 0 && (
					<div className="flex flex-col items-center justify-center py-16 bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
						<ShoppingBag
							size={48}
							className="text-slate-200 mb-4"
						/>
						<p className="font-bold text-slate-600">No entries yet today</p>
						<p className="text-sm text-slate-400 mt-1">
							Tap "Add Entry" to record your first transaction
						</p>
					</div>
				)}

				<div className="space-y-2">
					{todayTransactions.map((tx: any, index: number) => {
						const config = getTypeConfig(tx.type);
						const Icon = config.icon;
						const debit = isDebit(tx.type);
						return (
							<motion.div
								key={tx.id}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.04 }}
								className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow transition-all"
							>
								<div
									className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor}`}
								>
									<Icon
										size={18}
										className={config.color}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2">
										<Badge
											className={`text-[10px] font-black border px-1.5 py-0 ${config.badgeClass}`}
										>
											{config.label}
										</Badge>
									</div>
									{tx.note && (
										<p className="text-sm text-slate-500 mt-0.5 truncate">
											{tx.note}
										</p>
									)}
								</div>
								<div className="text-right shrink-0">
									<p
										className={`text-base font-black ${debit ? "text-red-600" : "text-green-600"}`}
									>
										{debit ? "-" : "+"}${parseFloat(tx.amount).toFixed(2)}
									</p>
									<p className="text-[10px] text-slate-400 font-medium flex items-center justify-end gap-1">
										<Clock size={9} />
										{format(new Date(tx.createdAt), "hh:mm a")}
									</p>
								</div>
							</motion.div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

export default DailyTransactionsPage;
