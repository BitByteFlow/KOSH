import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import type { CreateSaleDto } from "./dto/CreateSaleDto.dto";
import type { SaleResponseDto } from "./dto/SaleResponseDto.dto";

@Injectable()
export class SalesService {
	constructor(private readonly database: DatabaseService) {}

	async createSale(
		createSaleDto: CreateSaleDto,
		userId: string,
	): Promise<SaleResponseDto> {
		const { discount, paymentType, creditId, items, transactionNote } = createSaleDto;

		if (items.length === 0) {
			throw new BadRequestException("Sale must have at least one item");
		}

		if (paymentType === "CREDIT" && !creditId) {
			throw new BadRequestException("Credit account is required for credit sales");
		}

		try {
			return await this.database.prisma.$transaction(async (tsx) => {
				let subtotal = 0;
				let totalProfit = 0;

				for (const item of items) {
					const variant = await tsx.productVariant.findUnique({
						where: { id: item.variantId },
					});

					if (!variant) {
						throw new NotFoundException(`Product variant ${item.variantId} not found`);
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
						userId: userId,
						total: total,
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
					await tsx.productVariant.update({
						where: { id: item.variantId },
						data: {
							stock: {
								decrement: item.quantity,
							},
						},
					});
				}

				if (paymentType === "CASH" || paymentType === "ONLINE") {
					const today = new Date();
					today.setHours(0, 0, 0, 0);
					const tomorrow = new Date(today);
					tomorrow.setDate(tomorrow.getDate() + 1);

					let dailyBalance = await tsx.dailyBalance.findFirst({
						where: {
							userId: userId,
							date: {
								gte: today,
								lt: tomorrow,
							},
						},
					});

					if (!dailyBalance) {
						const yesterday = new Date(today);
						yesterday.setDate(yesterday.getDate() - 1);

						const yesterdayBalance = await tsx.dailyBalance.findFirst({
							where: {
								userId: userId,
								date: {
									gte: yesterday,
									lt: today,
								},
							},
							orderBy: {
								date: "desc",
							},
						});

						const openingCash = yesterdayBalance?.closingCash || 0;

						dailyBalance = await tsx.dailyBalance.create({
							data: {
								userId: userId,
								date: today,
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
							userId: userId,
							type: "SALE_INCOME",
							amount: total,
							note: transactionNote || `Sale #${sale.id.slice(0, 8)}`,
							saleId: sale.id,
							dailyBalanceId: dailyBalance.id,
						},
					});
				}

				return {
					id: sale.id,
					total: sale.total.toString(),
					discount: sale.discount.toString(),
					profit: sale.profit.toString(),
					paymentType: sale.paymentType,
					creditId: sale.creditId,
					items: sale.items.map((item) => ({
						id: item.id,
						quantity: item.quantity,
						sellPrice: item.sellPrice.toString(),
						costPrice: item.costPrice.toString(),
						variantId: item.variantId,
					})),
					createdAt: sale.createdAt,
					updatedAt: sale.updatedAt,
				};
			});
		} catch (error) {
			if (error instanceof BadRequestException || error instanceof NotFoundException) {
				throw error;
			}
			console.error("Error creating sale:", error);
			throw new InternalServerErrorException("Failed to create sale");
		}
	}

	async getSales(userId: string): Promise<SaleResponseDto[]> {
		try {
			const sales = await this.database.prisma.sale.findMany({
				where: { userId, deletedAt: null },
				include: {
					items: true,
				},
				orderBy: {
					createdAt: "desc",
				},
			});

			return sales.map((sale: any) => ({
				id: sale.id,
				total: sale.total.toString(),
				discount: sale.discount.toString(),
				profit: sale.profit.toString(),
				paymentType: sale.paymentType,
				creditId: sale.creditId,
				items: sale.items.map((item: any) => ({
					id: item.id,
					quantity: item.quantity,
					sellPrice: item.sellPrice.toString(),
					costPrice: item.costPrice.toString(),
					variantId: item.variantId,
				})),
				createdAt: sale.createdAt,
				updatedAt: sale.updatedAt,
			}));
		} catch (error) {
			console.error("Error fetching sales:", error);
			throw new InternalServerErrorException("Failed to fetch sales");
		}
	}
}
