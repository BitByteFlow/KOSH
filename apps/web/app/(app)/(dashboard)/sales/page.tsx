import React from "react";
import { SalesHistoryTable } from "@/modules/sales/components/SalesHistoryTable";
import { CreateSaleSheet } from "@/modules/sales/components/CreateSaleSheet";
import SalesMetrics from "@/modules/sales/components/SalesMetrics";
import { gql } from "@/gql";
import { PreloadQuery } from "@/lib/graphql/apolloServer";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sales",
	description:
		"Manage your daily sales, view transaction history, create new invoices, and track revenue.",
	openGraph: {
		title: "Sales - Kosh",
		description:
			"Manage your daily sales, view transaction history, create new invoices, and track revenue.",
	},
};

const GET_SALES_DATA = gql(`
	query getSalesData{
		getSales {
			success
			data {
				id
				total
				discount
				profit
				paymentType
				items {
					id
					quantity
					sellPrice
					costPrice
					variantId
				}
				createdAt
				updatedAt
				deletedAt
			}
		}
		getSalesMetrics {
			success
			data {
				totalTransactions
				totalProfit
				totalSales
				avgSaleValue
			}
		}
	}
`)

export default function SalesPage() {
	return (
		<PreloadQuery query={GET_SALES_DATA}>
			<div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
				<div className="flex items-center justify-between space-y-2">
					<div>
						<h2 className="text-3xl font-bold tracking-tighter">Sales Overview</h2>
						<p className="text-muted-foreground tracking-tight">
							Manage your daily sales, view history, and create new invoices.
						</p>
					</div>
					<div className="flex items-center space-x-2">
						<CreateSaleSheet />
					</div>
				</div>
				<SalesMetrics />
				<div className="flex-1 space-y-4">
					<h3 className="text-xl font-semibold tracking-tighter">Recent Sales History</h3>
					<SalesHistoryTable />
				</div>
			</div>
		</PreloadQuery>
	);
}
