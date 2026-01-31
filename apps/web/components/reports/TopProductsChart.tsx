import {
	BarChart,
	Bar,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface TopProduct {
	name: string;
	revenue: string;
	value: number;
}

interface TopProductsChartProps {
	data: TopProduct[];
}

export function TopProductsChart({ data }: TopProductsChartProps) {
	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<div className="mb-6 flex items-center justify-between">
				<h3 className="text-lg font-semibold text-foreground">Top Products</h3>
				<button className="text-sm font-medium text-primary hover:underline">
					View All
				</button>
			</div>
			<div className="space-y-4">
				{data.map((product, index) => (
					<div
						key={index}
						className="flex items-center justify-between"
					>
						<span className="text-sm font-medium text-foreground">
							{product.name}
						</span>
						<div className="flex items-center gap-4">
							<div className="h-2 w-48 rounded-full bg-gray-200">
								<div
									className="h-full rounded-full bg-gray-800"
									style={{
										width: `${(product.value / Math.max(...data.map((d) => d.value))) * 100}%`,
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
