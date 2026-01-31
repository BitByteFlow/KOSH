import React from "react";

import { MetricCard } from "@/components/dashboard/MetricCard";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
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

const metricCardValues: MetricCardProps[] = [
	{
		label: "Sales Today",
		value: "5200",
		change: { value: 8, label: "vs yesterday", positive: true },
		icon: DollarSign,
	},
	{
		label: "Orders",
		value: "72",
		icon: ShoppingCart,
		sublabel: "3 pending",
	},
	{
		label: "Cash in Hand",
		value: "28,300",
		sublabel: "Drawer balance",
		icon: Wallet,
	},
	{
		label: "Credit Given",
		value: "12,500",
		sublabel: "Given today",
		icon: CreditCard,
	},
];

const Dashboard = () => {
	return (
		<section className="flex-1 overflow-y-auto p-8">
			<div className="space-y-8">
				<section>
					<div className="mb-6">
						<h2 className="text-xl font-bold">Today's Sales Metrics</h2>
						<p className="text-sm text-muted-foreground">
							Operational insights to track daily performance and cash flow.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{metricCardValues.map((item) => (
							<MetricCard
								label={item.label}
								value={item.value}
								change={item.change}
								icon={item.icon}
								key={item.label}
								sublabel={item.sublabel}
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

export default Dashboard;
