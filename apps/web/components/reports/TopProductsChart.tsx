import { Button } from "@kosh/ui/components/button";

interface TopProduct {
	name: string;
	revenue: string;
	value: number;
}

interface TopProductsChartProps {
	data: TopProduct[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
	const maxRevenue = Math.max(...data.map((d) => d.value));

	return (
		<div className="rounded-lg shadow-md border border-border bg-card p-6">
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
				{data.map((product, index) => (
					<div
						key={index}
						className="flex items-center justify-between gap-4"
					>
						<span className="flex-1 truncate text-sm font-medium text-foreground">
							{product.name}
						</span>
						<div className="flex w-3/5 items-center gap-4">
							<div className="h-2 flex-1 rounded-full bg-muted">
								<div
									className="h-full rounded-full bg-primary"
									style={{
										width: `${(product.value / maxRevenue) * 100}%`,
									}}
								/>
							</div>
							<span className="w-16 text-right text-sm font-semibold text-foreground">
								{product.revenue}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
