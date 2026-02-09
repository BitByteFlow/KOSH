import React from "react";
import { TransactionTable } from "@/modules/dashboard/components/TransactionTable";
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
					<TransactionTable />
				</section>
			</div>
		</section>
	);
};

export default Dashboard;
