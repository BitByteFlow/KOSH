import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { AnalyticsMetrics } from "./entities/analyticsMetrics.entity";
import { AnalyticsTrend } from "./entities/analyticsTrend.entity";
import { TopProduct } from "./entities/topProduct.entity";

@Injectable()
export class ReportService {
	constructor(private readonly database: DatabaseService) { }

	async getAnalyticsMetrics(userId: string, startDate: Date, endDate: Date): Promise<AnalyticsMetrics[]> {
		try {
			const currentMetrics = await this.calculateMetrics(userId, startDate, endDate);

			// Calculate previous range for trend comparison
			const duration = endDate.getTime() - startDate.getTime();
			const prevEndDate = new Date(startDate);
			const prevStartDate = new Date(startDate.getTime() - duration);

			const prevMetrics = await this.calculateMetrics(userId, prevStartDate, prevEndDate);

			return [
				{
					label: "TOTAL SALES",
					value: currentMetrics.totalSales,
					trend: this.calculateTrend(currentMetrics.totalSales, prevMetrics.totalSales),
					trendLabel: `vs. Rs. ${prevMetrics.totalSales.toLocaleString()} last period`,
					isPositive: currentMetrics.totalSales >= prevMetrics.totalSales,
				},
				{
					label: "TOTAL PROFIT",
					value: currentMetrics.totalProfit,
					trend: this.calculateTrend(currentMetrics.totalProfit, prevMetrics.totalProfit),
					trendLabel: `Net profit margin: ${currentMetrics.totalSales > 0 ? Math.round((currentMetrics.totalProfit / currentMetrics.totalSales) * 100) : 0}%`,
					isPositive: currentMetrics.totalProfit >= prevMetrics.totalProfit,
				},
				{
					label: "TRANSACTIONS",
					value: currentMetrics.transactions,
					subtitle: `Daily Avg: ${(currentMetrics.transactions / (duration / (1000 * 60 * 60 * 24) || 1)).toFixed(1)} sales`,
					isPositive: currentMetrics.transactions >= prevMetrics.transactions,
				},
				{
					label: "AVG BILL VALUE",
					value: currentMetrics.avgBillValue,
					trend: this.calculateTrend(currentMetrics.avgBillValue, prevMetrics.avgBillValue),
					trendLabel: "Per transaction",
					isPositive: currentMetrics.avgBillValue >= prevMetrics.avgBillValue,
				},
			];
		} catch (error) {
			console.error("Error fetching analytics metrics:", error);
			throw new InternalServerErrorException("Failed to fetch analytics metrics");
		}
	}

	private async calculateMetrics(userId: string, start: Date, end: Date) {
		const sales = await this.database.prisma.sale.findMany({
			where: {
				userId,
				createdAt: {
					gte: start,
					lte: end,
				},
				deletedAt: null,
			},
		});

		const totalSales = sales.reduce((acc, sale) => acc + Number(sale.total), 0);
		const totalProfit = sales.reduce((acc, sale) => acc + Number(sale.profit), 0);
		const transactions = sales.length;
		const avgBillValue = transactions > 0 ? totalSales / transactions : 0;

		return {
			totalSales,
			totalProfit,
			transactions,
			avgBillValue,
		};
	}

	async getSalesTrend(userId: string, startDate: Date, endDate: Date): Promise<AnalyticsTrend[]> {
		try {
			const sales = await this.database.prisma.sale.findMany({
				where: {
					userId,
					createdAt: {
						gte: startDate,
						lte: endDate,
					},
					deletedAt: null,
				},
				select: {
					total: true,
					createdAt: true,
				},
				orderBy: {
					createdAt: 'asc',
				},
			});

			const salesMap = new Map<string, number>();
			sales.forEach((sale) => {
				const dateKey = sale.createdAt.toISOString().split('T')[0];
				salesMap.set(dateKey, (salesMap.get(dateKey) || 0) + Number(sale.total));
			});

			const trend: AnalyticsTrend[] = [];
			const current = new Date(startDate);
			const end = new Date(endDate);

			while (current <= end) {
				const dateKey = current.toISOString().split('T')[0];
				trend.push({
					label: dateKey,
					value: salesMap.get(dateKey) || 0,
				});
				current.setDate(current.getDate() + 1);
			}

			return trend;
		} catch (error) {
			console.error("Error fetching sales trend:", error);
			throw new InternalServerErrorException("Failed to fetch sales trend");
		}
	}

	async getTopProducts(userId: string, startDate: Date, endDate: Date): Promise<TopProduct[]> {
		try {
			const saleItems = await this.database.prisma.saleItem.findMany({
				where: {
					sale: {
						userId,
						createdAt: {
							gte: startDate,
							lte: endDate,
						},
						deletedAt: null,
					},
				},
				include: {
					variant: {
						include: {
							product: true,
						},
					},
				},
			});

			const aggregation = new Map<string, number>();
			saleItems.forEach((item) => {
				const productName = item.variant.product.name;
				const revenue = Number(item.sellPrice) * item.quantity;
				aggregation.set(productName, (aggregation.get(productName) || 0) + revenue);
			});

			const topProducts: TopProduct[] = Array.from(aggregation.entries())
				.map(([name, value]) => ({
					name,
					value,
					revenue: `Rs. ${value.toLocaleString()}`,
				}))
				.sort((a, b) => b.value - a.value)
				.slice(0, 5); // Return top 5

			return topProducts;
		} catch (error) {
			console.error("Error fetching top products:", error);
			throw new InternalServerErrorException("Failed to fetch top products");
		}
	}

	private calculateTrend(current: number, previous: number): number {
		if (previous === 0) return current > 0 ? 100 : 0;
		return Number((((current - previous) / previous) * 100).toFixed(1));
	}
}
