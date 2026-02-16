import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { AnalyticsMetrics } from "./entities/analyticsMetrics.entity";

@Injectable()
export class ReportService {
	constructor(private readonly database: DatabaseService) {}

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

	private calculateTrend(current: number, previous: number): number {
		if (previous === 0) return current > 0 ? 100 : 0;
		return Number((((current - previous) / previous) * 100).toFixed(1));
	}
}
