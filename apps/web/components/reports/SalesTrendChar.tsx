import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

interface SalesTrendChartProps {
	data: {
		week: string;
		sales: number;
	}[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
	return (
		<div className="rounded-lg border border-border bg-card p-6">
			<h3 className="mb-6 text-lg font-semibold text-foreground">
				Sales Trend
			</h3>
			<ResponsiveContainer
				width="100%"
				height={300}
			>
				<AreaChart
					data={data}
					margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
				>
					<defs>
						<linearGradient
							id="colorSales"
							x1="0"
							y1="0"
							x2="0"
							y2="1"
						>
							<stop
								offset="5%"
								stopColor="#10b981"
								stopOpacity={0.3}
							/>
							<stop
								offset="95%"
								stopColor="#10b981"
								stopOpacity={0}
							/>
						</linearGradient>
					</defs>
					<CartesianGrid
						strokeDasharray="3 3"
						stroke="#e5e7eb"
					/>
					<XAxis
						dataKey="week"
						stroke="#9ca3af"
						style={{ fontSize: "12px" }}
					/>
					<YAxis
						stroke="#9ca3af"
						style={{ fontSize: "12px" }}
					/>
					<Tooltip
						contentStyle={{
							backgroundColor: "#fff",
							border: "1px solid #e5e7eb",
							borderRadius: "8px",
						}}
					/>
					<Area
						type="monotone"
						dataKey="sales"
						stroke="#10b981"
						strokeWidth={2}
						fillOpacity={1}
						fill="url(#colorSales)"
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
