import React from "react";

import { TransactionTable } from "@/modules/dashboard/components/TransactionTable";

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


import { OpeningCashModal } from "@/modules/dashboard/components/OpeningCashModal";
import { WithdrawCashModal } from "@/modules/dashboard/components/WithdrawCashModal";
import DailyBalanceMetrics from "@/modules/dashboard/components/DailyBalanceMetrics";

const Dashboard = async () => {

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
					<DailyBalanceMetrics />
				</section>
				<section>
					<TransactionTable transactions={mockTransactions} />
				</section>
			</div>
		</section>
	);
};

export default Dashboard;
