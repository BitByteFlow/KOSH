import { Button } from "@kosh/ui/components/button";
import { useQuery } from "@apollo/client/react";
import { gql } from "@/gql";
import { useMemo } from "react";
import { getDateRange } from "@/lib/date-utils";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";

interface TopProductsChartProps {
	dateRange: string;
}

const GET_TOP_PRODUCTS = gql(`
	query getTopProducts ($startDate: String!, $endDate: String!) {
		getTopProducts (startDate: $startDate, endDate: $endDate) {
			success
			data {
				name
				revenue
				value
			}
		}
	}
`);

export function TopProductsChart({ dateRange }: TopProductsChartProps) {
	const { startDate, endDate } = useMemo(
		() => getDateRange(dateRange),
		[dateRange],
	);

	const { data: rawData, loading } = useQuery(GET_TOP_PRODUCTS, {
		variables: { startDate, endDate },
	});

	const productsResponse = useMemo(() =>
		parseGraphQLListResponse(rawData?.getTopProducts),
		[rawData?.getTopProducts]
	);

	const topProducts = productsResponse.data || [];

	if (loading) {
		return (
			<div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-border bg-card">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	const maxRevenue = topProducts.length > 0 ? Math.max(...topProducts.map((d) => d.value)) : 0;

	return (
		<div className="rounded-xl shadow-sm border border-border bg-card p-6">
			<div className="mb-6 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-foreground">Top Products</h3>
				<Button
					variant="link"
					className="text-sm"
				>
					View All
				</Button>
			</div>
			<div className="space-y-4">
				{topProducts.length > 0 ? (
					topProducts.map((product, index) => (
						<div
							key={index}
							className="flex items-center justify-between gap-4"
						>
							<span className="flex-1 truncate text-sm font-medium text-foreground">
								{product.name}
							</span>
							<div className="flex w-3/5 items-center gap-4">
								<div className="h-2 flex-1 rounded-full bg-muted/50">
									<div
										className="h-full rounded-full bg-primary"
										style={{
											width: `${maxRevenue > 0 ? (product.value / maxRevenue) * 100 : 0}%`,
										}}
									/>
								</div>
								<span className="w-24 text-right text-sm font-semibold text-foreground">
									Rs {product.revenue.toLocaleString()}
								</span>
							</div>
						</div>
					))
				) : (
					<div className="flex h-40 flex-col items-center justify-center space-y-2">
						<p className="text-sm text-muted-foreground">No data available for this range</p>
					</div>
				)}
			</div>
		</div>
	);
}
