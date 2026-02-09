import React from "react";

import { MetricCard } from "@/modules/dashboard/components/MetricCard";
import { TransactionTable } from "@/modules/dashboard/components/TransactionTable";
import {
	DollarSign,
	ShoppingCart,
	Wallet,
	CreditCard,
	Calendar,
	LucideIcon,
} from "lucide-react";
import { MetricCardProps } from "@/types/dashboard";

const mockTransactions = [
	{
		id: "1",
		date: "2025-07-01",
		customerName: "Robert Fox",
		initials: "RF",
		bg: "bg-red-500",
		productName: "Asus Zenbook",
		price: 900,
		quantity: 2,
		total: 1800,
		cashier: "Cody Fisher",
		cashierInitials: "CF",
		cashierBg: "bg-pink-500",
	},
	{
		id: "2",
		date: "2025-07-01",
		customerName: "Madhu Mia",
		initials: "MM",
		bg: "bg-blue-500",
		productName: "Asus Zenbook",
		price: 800,
		quantity: 1,
		total: 1800,
		cashier: "Albert Flores",
		cashierInitials: "AF",
		cashierBg: "bg-purple-500",
	},
	{
		id: "3",
		date: "2025-07-01",
		customerName: "Floyd Miles",
		initials: "FM",
		bg: "bg-orange-500",
		productName: "Asus Zenbook",
		price: 700,
		quantity: 3,
		total: 1800,
		cashier: "Devon Lane",
		cashierInitials: "DL",
		cashierBg: "bg-cyan-500",
	},
];



import { getDashboardMetrics } from "@/services/account.service";
import { OpeningCashModal } from "@/modules/dashboard/components/OpeningCashModal";
import { WithdrawCashModal } from "@/modules/dashboard/components/WithdrawCashModal";
import { TrendingUp, TrendingDown } from "lucide-react";

const Dashboard = async () => {
	const metrics = await getDashboardMetrics();

	const metricCardValues: MetricCardProps[] = [
		{
			label: "Opening Cash",
			value: formatCurrency(metrics?.openingCash || 0),
			icon: Wallet,
			sublabel: "Start of day",
			iconColor: "text-blue-500",
		},
		{
			label: "Sales Today",
			value: formatCurrency(metrics?.totalSales || 0),
			icon: DollarSign,
			iconColor: "text-green-500",
		},
		{
			label: "Cash In",
			value: formatCurrency(metrics?.totalCashIn || 0),
			icon: TrendingUp,
			sublabel: "Total inflows",
			iconColor: "text-emerald-500",
		},
		{
			label: "Total Expenses",
			value: formatCurrency(metrics?.totalExpense || 0),
			icon: ShoppingCart,
			iconColor: "text-orange-500",
		},
		{
			label: "Cash Out",
			value: formatCurrency(metrics?.totalCashOut || 0),
			icon: TrendingDown,
			sublabel: "Total outflows",
			iconColor: "text-red-500",
		},
		{
			label: "Closing Cash",
			value: formatCurrency(metrics?.closingCash || 0),
			icon: Wallet,
			sublabel: "Cash in hand",
			iconColor: "text-purple-500",
		},
	];

	return (
		<section className="flex-1 overflow-y-auto p-8">
			<div className="space-y-8">
				<section>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h2 className="text-xl font-bold">Today's Sales Metrics</h2>
							<p className="text-sm text-muted-foreground">
								Operational insights to track daily performance and cash flow.
							</p>
						</div>
						<div className="flex gap-2">
							<OpeningCashModal />
							<WithdrawCashModal />
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{metricCardValues.map((item) => (
							<MetricCard
								label={item.label}
								value={item.value}
								change={item.change}
								icon={item.icon}
								key={item.label}
								sublabel={item.sublabel}
								iconColor={item.iconColor}
							/>
						))}
					</div>
				</section>
				<section>
					<TransactionTable transactions={mockTransactions} />
				</section>
			</div>
		</section>
	);
};

function formatCurrency(amount: string | number) {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(Number(amount));
}

export default Dashboard;
