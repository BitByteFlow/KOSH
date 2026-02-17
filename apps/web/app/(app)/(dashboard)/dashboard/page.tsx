import React from "react";
import { TransactionTable } from "@/modules/dashboard/components/TransactionTable";
import { OpeningCashModal } from "@/modules/dashboard/components/OpeningCashModal";
import { WithdrawCashModal } from "@/modules/dashboard/components/WithdrawCashModal";
import DailyBalanceMetrics from "@/modules/dashboard/components/DailyBalanceMetrics";
import { PreloadQuery } from "@/lib/graphql/apolloServer";
import { gql } from "@/gql";

const DASHBOARD_METRICS = gql(`
	query dashboardMetrics($page: Int, $limit: Int, $sortBy: String, $sortOrder: String){
		getCurrentCashBalance {
				openingCash
				closingCash
				totalSales
				totalExpense
				totalCashIn
				totalCashOut
			}
			getAccountTransactions (page: $page, limit: $limit, sortBy: $sortBy, sortOrder: $sortOrder) {
				data {
					id
					type
					amount
					note
				createdAt
				updatedAt
			}
			meta {
				total
				page
				limit
				totalPages
				hasNext
				hasPrev
			}
		}
	}
`)

const Dashboard = async () => {
	return (
		<PreloadQuery query={DASHBOARD_METRICS} variables={{ page: 1, limit: 10, sortBy: 'createdAt', sortOrder: 'desc' }}>
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
		</PreloadQuery>
	);
};

export default Dashboard;
