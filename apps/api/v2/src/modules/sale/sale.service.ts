import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { TransactionType, NotificationType } from "@kosh/db";
import { CreateSaleInput } from "./dto/CreateSaleDto.dto";
import { Sale, SaleResponse } from "./entities/sale.entity";
import { SalesMetricsResponse } from "./entities/salesMetrics.entity";

import { NotificationService } from "../notification/notification.service";

@Injectable()
export class SalesService {
	constructor(
		private readonly database: DatabaseService,
		private readonly notificationService: NotificationService,
	) {}

	async createSale(
		createSaleDto: CreateSaleInput,
		userId: string,
	): Promise<SaleResponse> {
		const { discount, paymentType, creditId, items, transactionNote } =
			createSaleDto;

		if (items.length === 0) {
			throw new BadRequestException("Sale must have at least one item");
		}

		if (paymentType === "CREDIT" && !creditId && !createSaleDto.customerName) {
			throw new BadRequestException(
				"Credit account or customer details are required for credit sales",
			);
		}

		try {
			return await this.database.prisma.$transaction(async (tsx) => {
				let subtotal: number = 0;
				let totalProfit: number = 0;

				for (const item of items) {
					const variant = await tsx.productVariant.findUnique({
						where: { id: item.variantId },
					});

					if (!variant) {
						throw new NotFoundException(
							`Product variant ${item.variantId} not found`,
						);
					}

					if (variant.stock < item.quantity) {
						throw new BadRequestException(
							`Insufficient stock for variant ${item.variantId}. Available: ${variant.stock}, Required: ${item.quantity}`,
						);
					}

					const itemTotal = Number(item.sellPrice) * item.quantity;
					const itemCost = Number(item.costPrice) * item.quantity;
					const itemProfit = itemTotal - itemCost;

					subtotal += itemTotal;
					totalProfit += itemProfit;
				}

				const total = subtotal - Number(discount);

				if (total < 0) {
					throw new BadRequestException("Total cannot be negative");
				}

				const sale = await tsx.sale.create({
					data: {
						storeId: createSaleDto.storeId,
						userId: userId,
						total: total,
						subtotal: subtotal,
						discount: discount,
						profit: totalProfit,
						paymentType: paymentType,
						creditId: creditId || null,
						items: {
							create: items.map((item) => ({
								variantId: item.variantId,
								quantity: item.quantity,
								sellPrice: item.sellPrice,
								costPrice: item.costPrice,
							})),
						},
					},
					include: {
						items: true,
					},
				});

				for (const item of items) {
					const updatedVariant = await tsx.productVariant.update({
						where: { id: item.variantId },
						data: {
							stock: {
								decrement: item.quantity,
							},
						},
						include: {
							product: true,
						},
					});

					const settings = await tsx.settings.findUnique({
						where: { storeId: createSaleDto.storeId },
					});

					const threshold = settings?.lowStockThreshold ?? 10;

					if (updatedVariant.stock <= threshold) {
						await this.notificationService.createNotification(
							userId,
							NotificationType.LOW_STOCK,
							`Product "${updatedVariant.product.name}" is low on stock (${updatedVariant.stock} remaining)`,
							updatedVariant.id,
						);
					}
				}

				if (paymentType === "CASH" || paymentType === "ONLINE") {
					const todayStr = new Date().toISOString().split("T")[0];

					let dailyBalance = await tsx.dailyBalance.findUnique({
						where: {
							storeId_date: {
								storeId: createSaleDto.storeId,
								date: todayStr,
							},
						},
					});

					if (!dailyBalance) {
						const yesterday = new Date();
						yesterday.setDate(yesterday.getDate() - 1);
						const yesterdayStr = yesterday.toISOString().split("T")[0];

						const yesterdayBalance = await tsx.dailyBalance.findUnique({
							where: {
								storeId_date: {
									storeId: createSaleDto.storeId,
									date: yesterdayStr,
								},
							},
						});

						const openingCash = yesterdayBalance?.closingCash || 0;

						dailyBalance = await tsx.dailyBalance.create({
							data: {
								storeId: createSaleDto.storeId,
								date: todayStr,
								openingCash: openingCash,
								closingCash: openingCash,
								totalCashIn: 0,
								totalCashOut: 0,
								totalSales: 0,
								totalExpense: 0,
							},
						});
					}

					await tsx.dailyBalance.update({
						where: { id: dailyBalance.id },
						data: {
							closingCash: { increment: total },
							totalCashIn: { increment: total },
							totalSales: { increment: total },
						},
					});

					await tsx.accountTransaction.create({
						data: {
							storeId: createSaleDto.storeId,
							// userId: userId,
							type: TransactionType.SALE_INCOME,
							amount: total,
							note: transactionNote || `Sale #${sale.id.slice(0, 8)}`,
							saleId: sale.id,
							dailyBalanceId: dailyBalance.id,
						},
					});
				} else if (paymentType === "CREDIT") {
					let creditAccountId = creditId;

					if (!creditAccountId && createSaleDto.customerName) {
						const creditAccount = await tsx.creditAccount.create({
							data: {
								storeId: createSaleDto.storeId,
								customerName: createSaleDto.customerName,
								email: createSaleDto.customerEmail,
								contactNumber: createSaleDto.customerContact,
								balance: total,
							},
						});
						creditAccountId = creditAccount.id;

						await tsx.sale.update({
							where: { id: sale.id },
							data: { creditId: creditAccountId },
						});
					} else if (creditAccountId) {
						await tsx.creditAccount.update({
							where: { id: creditAccountId },
							data: {
								balance: { increment: total },
							},
						});
					}

					await tsx.accountTransaction.create({
						data: {
							storeId: createSaleDto.storeId,
							// userId: userId,
							type: TransactionType.DEBT,
							amount: total,
							note: transactionNote || `Credit Sale #${sale.id.slice(0, 8)}`,
							saleId: sale.id,
							creditAccountId: creditAccountId,
						},
					});
				}

				const formattedSale = {
					id: sale.id,
					total: Number(sale.total),
					discount: Number(sale.discount),
					profit: Number(sale.profit),
					paymentType: sale.paymentType,
					creditId: sale.creditId,
					items: sale.items.map((item) => ({
						id: item.id,
						quantity: item.quantity,
						sellPrice: Number(item.sellPrice),
						costPrice: Number(item.costPrice),
						variantId: item.variantId,
					})),
					createdAt: sale.createdAt,
					updatedAt: sale.updatedAt,
				};

				return {
					success: true,
					message: "Sale created successfully",
					data: [formattedSale],
				};
			});
		} catch (error) {
			if (
				error instanceof BadRequestException ||
				error instanceof NotFoundException
			) {
				throw error;
			}
			console.error("Error creating sale:", error);
			throw new InternalServerErrorException("Failed to create sale");
		}
	}

	async getMetrices(
		userId: string,
		storeId: string,
	): Promise<SalesMetricsResponse> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const sales = await this.database.prisma.sale.findMany({
				where: {
					storeId,
					createdAt: {
						gte: today,
					},
					deletedAt: null,
				},
			});

			const totalSales = sales.reduce(
				(acc, sale) => acc + Number(sale.total),
				0,
			);
			const totalProfit = sales.reduce(
				(acc, sale) => acc + Number(sale.profit),
				0,
			);
			const totalTransactions = sales.length;
			const avgSaleValue =
				totalTransactions > 0 ? totalSales / totalTransactions : 0;

			return {
				success: true,
				message: "Sales metrics fetched successfully",
				data: {
					totalSales,
					totalTransactions,
					avgSaleValue,
					totalProfit,
				},
			};
		} catch (error) {
			console.error("Error fetching sales metrics:", error);
			throw new InternalServerErrorException("Failed to fetch sales metrics");
		}
	}

	async getSales(userId: string, storeId: string): Promise<SaleResponse> {
		try {
			const now = new Date();
			const today = new Date(
				Date.UTC(
					now.getUTCFullYear(),
					now.getUTCMonth(),
					now.getUTCDate(),
					0,
					0,
					0,
					0,
				),
			);
			const tomorrow = new Date(today);
			tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
			const sales = await this.database.prisma.sale.findMany({
				where: {
					storeId,
					deletedAt: null,
					createdAt: { gte: today, lt: tomorrow },
				},
				include: {
					items: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			const salesData = sales.map((sale: any) => ({
				id: sale.id,
				total: Number(sale.total),
				discount: Number(sale.discount),
				profit: Number(sale.profit),
				paymentType: sale.paymentType,
				creditId: sale.creditId,
				items: sale.items.map((item: any) => ({
					id: item.id,
					quantity: item.quantity,
					sellPrice: Number(item.sellPrice),
					costPrice: Number(item.costPrice),
					variantId: item.variantId,
				})),
				createdAt: sale.createdAt,
				updatedAt: sale.updatedAt,
			}));

			return {
				success: true,
				message: "Sales fetched successfully",
				data: salesData,
			};
		} catch (error) {
			console.error("Error fetching sales:", error);
			throw new InternalServerErrorException("Failed to fetch sales");
		}
	}
}
