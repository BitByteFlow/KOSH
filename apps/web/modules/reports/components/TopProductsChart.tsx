"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";
import {
	GetTopProductsQuery,
	GetTopProductsQueryVariables,
} from "@/gql/graphql";
import { getDateRange } from "@/lib/date-utils";
import { parseGraphQLListResponse } from "@/lib/graphql/utils";
import { GET_TOP_PRODUCTS } from "@/services/reportsAnalytics.service";

interface TopProductsChartProps {
	dateRange: string;
}

type TopProduct = NonNullable<GetTopProductsQuery['getTopProducts']['data']>[number];

export function TopProductsChart({ dateRange }: TopProductsChartProps) {
	const { startDate, endDate } = useMemo(
		() => getDateRange(dateRange),
		[dateRange],
	);

	const { data: rawData, loading } = useQuery<GetTopProductsQuery, GetTopProductsQueryVariables>(GET_TOP_PRODUCTS, {
		variables: { startDate, endDate }
	});

	const productsResponse = useMemo(() =>
		parseGraphQLListResponse(rawData?.getTopProducts),
		[rawData?.getTopProducts]
	);

	const topProducts: TopProduct[] = (productsResponse.data as TopProduct[]) || [];

	const totalRevenue = useMemo(
		() => topProducts.reduce((acc: number, d: TopProduct) => acc + (Number(d.revenue) || 0), 0),
		[topProducts],
	);

	if (loading) {
		return (
			<div className="flex h-[400px] w-full items-center justify-center rounded-lg border border-border bg-card">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	// const maxRevenue = topProducts.length > 0 ? Math.max(...topProducts.map((d: TopProduct) => d.value)) : 0;

	return (
		<div className="rounded-xl shadow-sm border border-border bg-card p-6">
			<div className="mb-6 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-foreground">Top Products</h3>
				{/* <Button
					variant="link"
					className="text-sm"
				>
					View All
				</Button> */}
			</div>
			<div className="space-y-4">
				{topProducts.length > 0 ? (
					topProducts.map((product: TopProduct) => (
						<div
							key={product.name}
							className="flex items-center justify-between"
						>
							<div className="flex items-center gap-3">
								<div className="h-2 w-2 rounded-full bg-primary" />
								<span className="text-sm font-medium">
									{product.name}
								</span>
							</div>
							<div className="flex items-center gap-4">
								<span className="text-sm text-muted-foreground">
									{product.revenue
										? `${product.revenue.toLocaleString()}`
										: "0"}
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
