import { Button } from "@kosh/ui/components/button";
import React from "react";

interface PaymentTypeStats {
	cashRevenue: number;
	onlineRevenue: number;
	creditRevenue: number;
	totalRevenue: number;
}

interface TransactionsStatsLegendProps {
	stats?: PaymentTypeStats;
	selectedPaymentType: "CASH" | "ONLINE" | "CREDIT" | "ALL";
	onPaymentTypeChange: (type: "CASH" | "ONLINE" | "CREDIT" | "ALL") => void;
}

export const TransactionsStatsLegend: React.FC<TransactionsStatsLegendProps> =
	React.memo(({ stats, selectedPaymentType, onPaymentTypeChange }) => {
		const formatCurrency = (amount: number) => {
			return `Rs. ${amount.toFixed(2)}`;
		};

		// const getPercentage = (amount: number) => {
		// 	if (!stats?.totalRevenue) return 0;
		// 	return Math.round((amount / stats.totalRevenue) * 100);
		// };

		const StatItem = ({
			type,
			label,
			color,
			bgColor,
			revenue,
		}: {
			type: "CASH" | "ONLINE" | "CREDIT" | "ALL";
			label: string;
			color: string;
			bgColor: string;
			revenue?: number;
		}) => (
			<Button
				variant={"ghost"}
				onClick={() => onPaymentTypeChange(type)}
				className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
					selectedPaymentType === type
						? `${bgColor} border ${color} border-current`
						: "hover:bg-slate-100"
				}`}
				aria-pressed={selectedPaymentType === type}
				aria-label={`Filter by ${label} ${revenue ? `(${formatCurrency(revenue)})` : ""}`}
			>
				<span
					className={`text-sm font-bold ${
						selectedPaymentType === type ? color : "text-slate-400"
					}`}
				>
					{label}
					{revenue !== undefined && (
						<span className="ml-1 text-xs font-medium">
							({formatCurrency(revenue)})
						</span>
					)}
				</span>
			</Button>
		);

		return (
			<fieldset
				className="flex flex-wrap items-center gap-4 text-sm"
				aria-label="Payment type filter"
			>
				<StatItem
					type="CASH"
					label="Cash"
					color="text-green-600"
					bgColor="bg-white"
					revenue={stats?.cashRevenue}
				/>
				<StatItem
					type="ONLINE"
					label="Online"
					color="text-blue-600"
					bgColor="bg-white"
					revenue={stats?.onlineRevenue}
				/>
				<StatItem
					type="CREDIT"
					label="Credit"
					color="text-orange-600"
					bgColor="bg-white"
					revenue={stats?.creditRevenue}
				/>
				<StatItem
					type="ALL"
					label="All"
					color="text-white"
					bgColor="bg-primary"
				/>
			</fieldset>
		);
	});

TransactionsStatsLegend.displayName = "TransactionsStatsLegend";

export default TransactionsStatsLegend;
