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
import type { TransactionType, AccountTransaction } from "@/types/api";

const TRANSACTION_TYPES = [
	{
		value: "WITHDRAWAL",
		label: "Withdrawal",
		icon: ArrowUpRight,
		color: "text-red-500",
		bgColor: "bg-red-50",
		badgeClass: "bg-red-100 text-red-700 border-red-200",
		isCashOut: true,
	},
	{
		value: "EXPENSES",
		label: "Expense",
		icon: Minus,
		color: "text-orange-500",
		bgColor: "bg-orange-50",
		badgeClass: "bg-orange-100 text-orange-700 border-orange-200",
		isCashOut: true,
	},
	{
		value: "PURCHASE",
		label: "Purchase",
		icon: ShoppingBag,
		color: "text-blue-500",
		bgColor: "bg-blue-50",
		badgeClass: "bg-blue-100 text-blue-700 border-blue-200",
		isCashOut: true,
	},
	{
		value: "ADJUSTMENT",
		label: "Adjustment",
		icon: RefreshCw,
		color: "text-purple-500",
		bgColor: "bg-purple-50",
		badgeClass: "bg-purple-100 text-purple-700 border-purple-200",
		isCashOut: false,
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
		isCashOut: false,
	};

const isCashOutType = (type: string) => {
	const config = getTypeConfig(type);
	return config.isCashOut;
};

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
					<h3 className="font-bold text-slate-800 uppercase tracking-tight text-normal">
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
										<Button
											variant={"ghost"}
											key={value}
											type="button"
											onClick={() => setSelectedType(value as TransactionType)}
											className={`flex items-center gap-2 p-6 rounded-xl border-2 font-bold text-sm transition-all ${
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
										</Button>
									),
								)}
							</div>
						</div>

						<div>
							<span className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">
								Amount
							</span>
							<div className="relative">
								<Input
									type="number"
									min="0.01"
									step="0.01"
									value={amount}
									onChange={(e) => setAmount(e.target.value)}
									placeholder="Rs. 0.00"
									className="h-12 rounded-xl border-slate-200 text-lg font-bold pl-4"
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

interface SummaryCardProps {
	title: string;
	amount: number;
	icon: React.ElementType;
	gradient: string;
	shadowColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
	title,
	amount,
	icon: Icon,
	gradient,
	shadowColor,
}) => {
	return (
		<Card
			className={`rounded-2xl border-0 bg-gradient-to-br ${gradient} shadow-lg ${shadowColor}/20`}
		>
			<CardContent className="p-5">
				<div className="flex items-center justify-between mb-3">
					<div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
						<Icon
							size={18}
							className="text-white"
						/>
					</div>
					<span className="text-white/80 text-[10px] font-black uppercase tracking-wider">
						{title}
					</span>
				</div>
				<p className="text-white text-2xl font-black tracking-tight">
					Rs. {amount.toFixed(2)}
				</p>
			</CardContent>
		</Card>
	);
};

const DailyTransactionsPage: React.FC = () => {
	const [showAddForm, setShowAddForm] = useState(false);
	const { data, isLoading: loading, error, refetch } = useAllTransactions();
	console.log("thi sis dat in trasnaction", data);

	const transactions = (data as AccountTransaction[]) ?? [];
	const today = format(new Date(), "yyyy-MM-dd");
	const todayTransactions = transactions.filter(
		(t) => format(new Date(t.createdAt), "yyyy-MM-dd") === today,
	);

	const totalCashIn = todayTransactions
		.filter((t) => !isCashOutType(t.type))
		.reduce((acc, t) => acc + Number(t.amount), 0);

	const totalCashOut = todayTransactions
		.filter((t) => isCashOutType(t.type))
		.reduce((acc, t) => acc + Number(t.amount), 0);

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
		<div className="p-6 max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
				<div>
					<p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
						{format(new Date(), "EEEE, MMMM d, yyyy")}
					</p>
					<h1 className="text-4xl font-black text-slate-900 tracking-tight mt-1 pt-2">
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

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
				<SummaryCard
					title="Cash In"
					amount={totalCashIn}
					icon={TrendingUp}
					gradient="from-green-500 to-emerald-600"
					shadowColor="shadow-green-500"
				/>
				<SummaryCard
					title="Cash Out"
					amount={totalCashOut}
					icon={TrendingDown}
					gradient="from-red-500 to-rose-600"
					shadowColor="shadow-red-500"
				/>
				<SummaryCard
					title="Net Balance"
					amount={Math.abs(netBalance)}
					icon={Wallet}
					gradient={
						netBalance >= 0
							? "from-blue-500 to-indigo-600"
							: "from-slate-500 to-slate-700"
					}
					shadowColor={netBalance >= 0 ? "shadow-blue-500" : "shadow-slate-500"}
				/>
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
					<h2 className="font-semibold text-slate-800 tracking-tighter  text-lg">
						Today's Entries
					</h2>
					<div className="h-px flex-1 bg-slate-200" />
					<Badge
						variant="outline"
						className="text-sm font-semibold px-2 border-slate-400 text-slate-400"
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
					{todayTransactions.map((tx: AccountTransaction, index: number) => {
						const config = getTypeConfig(tx.type);
						const Icon = config.icon;
						const isOut = isCashOutType(tx.type);
						return (
							<motion.div
								key={tx.id}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.04 }}
								className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-default"
							>
								<div
									className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor}`}
								>
									<Icon
										size={20}
										className={config.color}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<Badge
											className={`text-xs font-semibold border px-2 py-0.5 ${config.badgeClass}`}
										>
											{config.label}
										</Badge>
									</div>
									{tx.note && (
										<p className="text-sm text-slate-500 mt-1 truncate">
											{tx.note}
										</p>
									)}
								</div>
								<div className="text-right shrink-0">
									<p
										className={`text-lg font-bold ${isOut ? "text-red-600" : "text-green-600"}`}
									>
										{isOut ? "-" : "+"}Rs. {Number(tx.amount).toFixed(2)}
									</p>
									<p className="text-xs text-slate-400 font-medium flex items-center justify-end gap-1 mt-0.5">
										<Clock size={10} />
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
