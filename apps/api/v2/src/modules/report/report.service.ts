import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { AnalyticsMetricsResponse } from "./entities/analyticsMetrics.entity";
import { AnalyticsTrend, AnalyticsTrendResponse } from "./entities/analyticsTrend.entity";
import { TopProduct, TopProductResponse } from "./entities/topProduct.entity";
import { SaleReportFilter, SaleReportResponse } from "./entities/saleReport.entity";
import { ProductPerformanceFilter, ProductPerformanceResult, ProductPerformance } from "./entities/productPerformance.entity";
import { InventoryReportFilter, InventoryReportResult, InventoryReport } from "./entities/inventoryReport.entity";
import { AnalyticsTransactionFilter, AnalyticsTransactionResult, AnalyticsTransaction } from "./entities/analyticsTransaction.entity";

@Injectable()
export class ReportService {
	constructor(private readonly database: DatabaseService) { }

	async getAnalyticsMetrics(storeId: string, startDate: Date, endDate: Date): Promise<AnalyticsMetricsResponse> {
		try {
			const currentMetrics = await this.calculateMetrics(storeId, startDate, endDate);

			const duration = endDate.getTime() - startDate.getTime();
			const prevEndDate = new Date(startDate);
			const prevStartDate = new Date(startDate.getTime() - duration);

			const prevMetrics = await this.calculateMetrics(storeId, prevStartDate, prevEndDate);

			return {
				success: true,
				message: "Analytics metrics fetched successfully",
				data: [
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
				]
			}
		} catch (error) {
			console.error("Error fetching analytics metrics:", error);
			throw new InternalServerErrorException("Failed to fetch analytics metrics");
		}
	}

	private async calculateMetrics(storeId: string, start: Date, end: Date) {
		const sales = await this.database.prisma.sale.findMany({
			where: {
				storeId,
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

	async getSalesTrend(storeId: string, startDate: Date, endDate: Date): Promise<AnalyticsTrendResponse> {
		try {
			const sales = await this.database.prisma.sale.findMany({
				where: {
					storeId,
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

			return {
				success: true,
				message: "Sales trend fetched successfully",
				data: trend
			};
		} catch (error) {
			console.error("Error fetching sales trend:", error);
			throw new InternalServerErrorException("Failed to fetch sales trend");
		}
	}

	async getTopProducts(storeId: string, startDate: Date, endDate: Date): Promise<TopProductResponse> {
		try {
			const saleItems = await this.database.prisma.saleItem.findMany({
				where: {
					sale: {
						storeId,
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
				.slice(0, 5);

			return {
				success: true,
				message: "Top products fetched successfully",
				data: topProducts
			};
		} catch (error) {
			console.error("Error fetching top products:", error);
			throw new InternalServerErrorException("Failed to fetch top products");
		}
	}

	async getSalesReport(storeId: string, filters: SaleReportFilter): Promise<SaleReportResponse> {
		try {
			const { startDate, endDate, paymentMethods, statuses, searchQuery } = filters;

			const where: any = {
				storeId,
				deletedAt: null,
			};

			if (startDate || endDate) {
				where.createdAt = {};
				if (startDate) where.createdAt.gte = new Date(startDate);
				if (endDate) where.createdAt.lte = new Date(endDate);
			}

			if (paymentMethods && paymentMethods.length > 0) {
				where.paymentType = { in: paymentMethods };
			}

			if (statuses && statuses.length > 0) {
				const statusConditions: any[] = [];
				if (statuses.includes("Pending")) {
					statusConditions.push({ NOT: { creditId: null } });
				}
				if (statuses.includes("Completed")) {
					statusConditions.push({ creditId: null });
				}

				if (statusConditions.length > 0) {
					if (where.OR) {
						// Merge with existing search OR if necessary, but simpler to just use AND for status
						where.AND = [
							{ OR: where.OR },
							{ OR: statusConditions }
						];
						delete where.OR;
					} else {
						where.OR = statusConditions;
					}
				}
			}

			if (searchQuery) {
				const searchOR = [
					{ id: { contains: searchQuery, mode: 'insensitive' } },
					{
						credit: {
							customerName: { contains: searchQuery, mode: 'insensitive' }
						}
					}
				];
				if (where.AND) {
					where.AND.push({ OR: searchOR });
				} else if (where.OR) {
					// This would be the status OR, so we need to AND it
					const statusOR = where.OR;
					delete where.OR;
					where.AND = [
						{ OR: statusOR },
						{ OR: searchOR }
					];
				} else {
					where.OR = searchOR;
				}
			}

			const sales = await this.database.prisma.sale.findMany({
				where,
				include: {
					credit: true,
					_count: {
						select: { items: true }
					}
				},
				orderBy: {
					createdAt: 'desc',
				},
			});

			const saleReportData = sales.map((sale) => ({
				id: sale.id,
				date: sale.createdAt.toISOString().split('T')[0],
				customer: sale.credit?.customerName || "Walk-in Customer",
				items: sale._count.items,
				total: Number(sale.total),
				payment: sale.paymentType,
				status: sale.creditId ? "Pending" : "Completed", // Simplified status logic
			})
			);
			return {
				success: true,
				message: "Sales report fetched successfully",
				data: saleReportData
			}
		} catch (error) {
			console.error("Error fetching sales report:", error);
			throw new InternalServerErrorException("Failed to fetch sales report");
		}
	}

	async getProductPerformance(storeId: string, filters: ProductPerformanceFilter): Promise<ProductPerformanceResult> {
		try {
			const {
				startDate,
				endDate,
				categories,
				statuses,
				minSold,
				maxSold,
				searchQuery,
				skip,
				take
			} = filters;

			const where: any = {
				storeId,
				deletedAt: null,
			};

			if (searchQuery) {
				where.OR = [
					{ name: { contains: searchQuery, mode: 'insensitive' } },
					{ sku: { contains: searchQuery, mode: 'insensitive' } },
				];
			}

			if (categories && categories.length > 0) {
				where.category = {
					name: { in: categories }
				};
			}

			// Status filter needs to handle "Active" / "Out of Stock"
			// This depends on how status is defined in your DB, assuming a 'status' field or similar
			// If it's derived, we might need more complex logic. 
			// For now assuming a direct 'status' field if provided, otherwise generic filtering.
			if (statuses && statuses.length > 0) {
				// Adjust based on actual DB schema. If status is a field:
				// where.status = { in: statuses };
			}

			// Fetch products and their sales within the period
			const products = await this.database.prisma.product.findMany({
				where,
				include: {
					category: true,
					variants: {
						include: {
							saleItems: {
								where: {
									sale: {
										createdAt: {
											gte: startDate ? new Date(startDate) : undefined,
											lte: endDate ? new Date(endDate) : undefined,
										}
									}
								},
								include: {
									sale: true
								}
							}
						}
					}
				},
				orderBy: {
					name: 'asc'
				}
			});

			let performanceData: ProductPerformance[] = products.map(product => {
				let totalSold = 0;
				let totalRevenue = 0;
				let totalCost = 0;

				product.variants.forEach(variant => {
					variant.saleItems.forEach(item => {
						totalSold += item.quantity;
						totalRevenue += Number(item.sellPrice) * item.quantity;
						totalCost += Number(item.costPrice) * item.quantity;
					});
				});

				const margin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0;

				return {
					id: product.id,
					name: product.name,
					sku: product.variants[0]?.sku || "N/A",
					category: product.category?.name || "Uncategorized",
					sold: totalSold,
					revenue: totalRevenue,
					margin: Math.round(margin * 100) / 100,
					status: product.deletedAt ? "Inactive" : "Active", // Simplified
				};
			});

			// Post-fetch filters for aggregated values
			if (minSold !== undefined) {
				performanceData = performanceData.filter(p => p.sold >= minSold);
			}
			if (maxSold !== undefined) {
				performanceData = performanceData.filter(p => p.sold <= maxSold);
			}

			const totalCount = performanceData.length;
			const paginatedItems = performanceData.slice(skip, skip + take);

			return {
				items: paginatedItems,
				totalCount
			};

		} catch (error) {
			console.error("Error fetching product performance:", error);
			throw new InternalServerErrorException("Failed to fetch product performance");
		}
	}

	async getInventoryReport(storeId: string, filters: InventoryReportFilter): Promise<InventoryReportResult> {
		try {
			const {
				categories,
				statuses,
				minStock,
				maxStock,
				searchQuery,
				skip,
				take
			} = filters;

			const where: any = {
				storeId,
				deletedAt: null,
			};

			if (searchQuery) {
				where.OR = [
					{ name: { contains: searchQuery, mode: 'insensitive' } },
					{ variants: { some: { sku: { contains: searchQuery, mode: 'insensitive' } } } },
				];
			}

			if (categories && categories.length > 0) {
				where.category = {
					name: { in: categories }
				};
			}

			// Fetch products and their variants to calculate stock and status
			const products = await this.database.prisma.product.findMany({
				where,
				include: {
					category: true,
					variants: true,
				},
				orderBy: {
					name: 'asc'
				}
			});

			let reportData: InventoryReport[] = products.map(product => {
				const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
				const totalValue = product.variants.reduce((sum, v) => sum + (v.stock * Number(v.costPrice)), 0);

				// Determine status based on variants
				let status = "In Stock";
				const hasLowStock = product.variants.some(v => v.lowStock || (v.stock <= 5 && v.stock > 0));
				const isOutOfStock = product.variants.every(v => v.stock === 0);

				if (isOutOfStock) {
					status = "Out of Stock";
				} else if (hasLowStock) {
					status = "Low Stock";
				}

				return {
					id: product.id,
					name: product.name,
					sku: product.variants[0]?.sku || "N/A",
					category: product.category?.name || "Uncategorized",
					stock: totalStock,
					value: totalValue,
					status,
				};
			});

			// Filter by status (client-side for derived statuses)
			if (statuses && statuses.length > 0) {
				reportData = reportData.filter(item => statuses.includes(item.status));
			}

			// Filter by stock range
			if (minStock !== undefined) {
				reportData = reportData.filter(item => item.stock >= minStock);
			}
			if (maxStock !== undefined) {
				reportData = reportData.filter(item => item.stock <= maxStock);
			}

			const totalCount = reportData.length;
			const paginatedItems = reportData.slice(skip, skip + take);

			return {
				success: true,
				message: "Inventory report fetched successfully",
				data: paginatedItems,
				totalCount
			};

		} catch (error) {
			console.error("Error fetching inventory report:", error);
			throw new InternalServerErrorException("Failed to fetch inventory report");
		}
	}

	async getAnalyticsTransactions(storeId: string, filters: AnalyticsTransactionFilter): Promise<AnalyticsTransactionResult> {
		try {
			const {
				startDate,
				endDate,
				paymentTypes,
				status,
				minAmount,
				maxAmount,
				searchQuery,
				skip,
				take
			} = filters;

			const where: any = {
				storeId,
				deletedAt: null,
			};

			if (startDate || endDate) {
				where.createdAt = {};
				if (startDate) where.createdAt.gte = startDate;
				if (endDate) where.createdAt.lte = endDate;
			}

			if (paymentTypes && paymentTypes.length > 0) {
				where.paymentType = { in: paymentTypes };
			}

			if (searchQuery) {
				where.id = { contains: searchQuery, mode: 'insensitive' };
			}

			if (status && status !== 'all') {
				if (status === 'Completed') {
					where.isCredit = false;
				} else if (status === 'Pending') {
					where.isCredit = true;
				}
			}

			if (minAmount !== undefined || maxAmount !== undefined) {
				where.totalAmount = {};
				if (minAmount !== undefined) where.totalAmount.gte = minAmount;
				if (maxAmount !== undefined) where.totalAmount.lte = maxAmount;
			}

			const [items, totalCount] = await Promise.all([
				this.database.prisma.sale.findMany({
					where,
					skip,
					take,
					orderBy: { createdAt: 'desc' },
					include: {
						items: true,
					}
				}),
				this.database.prisma.sale.count({ where })
			]);

			const reportData: AnalyticsTransaction[] = items.map(sale => {
				const profit = sale.items.reduce((sum, item) => {
					return sum + (Number(item.sellPrice) - Number(item.costPrice)) * item.quantity;
				}, 0);

				return {
					id: sale.id,
					date: sale.createdAt.toLocaleDateString(),
					time: sale.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					paymentType: sale.paymentType,
					amount: Number(sale.total),
					profit: Number(profit),
					status: sale.creditId ? "Pending" : "Completed",
				};
			});

			return {
				success: true,
				message: "Analytics transactions fetched successfully",
				data: reportData,
				totalCount
			};

		} catch (error) {
			console.error("Error fetching analytics transactions:", error);
			throw new InternalServerErrorException("Failed to fetch analytics transactions");
		}
	}

	private calculateTrend(current: number, previous: number): number {
		if (previous === 0) return current > 0 ? 100 : 0;
		return Number((((current - previous) / previous) * 100).toFixed(1));
	}
}
