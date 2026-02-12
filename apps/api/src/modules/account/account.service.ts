import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

import { CategoryResponseDto } from "../categories/dto/CategoryResponseDto";
import { BalanceDto } from "./dto/BalanceDto.dto";
import { CreateTransactionDto } from "./dto/CreateTransactionDto.dto";
import { Prisma } from "@kosh/db";

@Injectable()
export class AccountService {
	constructor(private readonly database: DatabaseService) {}

	/**
	 * Creates a transaction and updates the daily balance accordingly.
	 * Handles both cash-in (INITIAL_CAPITAL, ADDITIONAL_CAPITAL, SALE_INCOME, CREDIT_RECEIVED)
	 * and cash-out (WITHDRAWAL, PURCHASE, EXPENSES, DEBT_PAID) transactions.
	 *
	 * @param createTransactionDto - Transaction details (type, amount, note)
	 * @param userId - User ID from authenticated session
	 * @returns Success response with status and message
	 * @throws BadRequestException - If amount is invalid or transaction type is unknown
	 * @throws ConflictException - If business rules are violated (e.g., insufficient funds, duplicate INITIAL_CAPITAL)
	 */
	async createTransaction(
		createTransactionDto: CreateTransactionDto,
		userId: string,
	): Promise<CategoryResponseDto> {
		const { type, amount, note } = createTransactionDto;

		if (amount <= 0) {
			throw new BadRequestException("Amount must be positive");
		}

		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		yesterday.setHours(0, 0, 0, 0);

		return await this.database.prisma
			.$transaction(async (tsx) => {
				const hasAnyBalance = await tsx.dailyBalance.count({
					where: { userId: userId },
				});

				if (hasAnyBalance === 0 && type !== "INITIAL_CAPITAL") {
					throw new ConflictException(
						"First transaction must be INITIAL_CAPITAL",
					);
				}

				if (hasAnyBalance > 0 && type === "INITIAL_CAPITAL") {
					throw new ConflictException("INITIAL_CAPITAL can only be set once");
				}

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

					const openingBalance = Number(openingCash);
					if (
						(type === "WITHDRAWAL" ||
							type === "PURCHASE" ||
							type === "EXPENSES" ||
							type === "DEBT_PAID") &&
						amount > openingBalance
					) {
						throw new ConflictException(
							`Insufficient funds for ${type.toLowerCase()}. Available: ${openingBalance}, Required: ${amount}`,
						);
					}

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
				} else {
					const currentBalance = Number(dailyBalance.closingCash);
					if (
						(type === "WITHDRAWAL" ||
							type === "PURCHASE" ||
							type === "EXPENSES" ||
							type === "DEBT_PAID") &&
						amount > currentBalance
					) {
						throw new ConflictException(
							`Insufficient funds for ${type.toLowerCase()}. Available: ${currentBalance}, Required: ${amount}`,
						);
					}
				}

				const updateData: any = {};

				switch (type) {
					case "INITIAL_CAPITAL":
					case "ADDITIONAL_CAPITAL":
					case "SALE_INCOME":
					case "CREDIT_RECEIVED":
						updateData.closingCash = { increment: amount };
						updateData.totalCashIn = { increment: amount };
						if (type === "SALE_INCOME" || type === "CREDIT_RECEIVED") {
							updateData.totalSales = { increment: amount };
						}
						break;

					case "WITHDRAWAL":
					case "PURCHASE":
					case "EXPENSES":
					case "DEBT_PAID":
						updateData.closingCash = { decrement: amount };
						updateData.totalCashOut = { increment: amount };
						if (
							type === "PURCHASE" ||
							type === "EXPENSES" ||
							type === "DEBT_PAID"
						) {
							updateData.totalExpense = { increment: amount };
						}
						break;

					default:
						throw new BadRequestException(`Invalid transaction type: ${type}`);
				}

				await tsx.dailyBalance.update({
					where: { id: dailyBalance.id },
					data: updateData,
				});

				await tsx.accountTransaction.create({
					data: {
						userId: userId,
						type: type,
						amount: amount,
						note: note,
						dailyBalanceId: dailyBalance.id,
					},
				});

				return {
					status: "success",
					message: "Transaction created successfully",
				};
			})
			.catch((error) => {
				if (error.code === "P2002") {
					throw new ConflictException(
						"Please try again. Concurrent transaction detected.",
					);
				}
				throw error;
			});
	}

	/**
	 * Retrieves the current day's cash balance for a user.
	 * If no balance exists for today, creates one using yesterday's closing balance as opening balance.
	 *
	 * @param userId - User ID from authenticated session
	 * @returns BalanceDto containing opening/closing cash, total cash in/out, sales, and expenses
	 * @throws InternalServerErrorException - If database operation fails
	 */
	async getCurrentCashBalance(userId: string): Promise<BalanceDto> {
		try {
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const tomorrow = new Date(today);
			tomorrow.setDate(tomorrow.getDate() + 1);

			const yesterday = new Date(today);
			yesterday.setDate(yesterday.getDate() - 1);
			yesterday.setHours(0, 0, 0, 0);

			return await this.database.prisma.$transaction(async (tsx) => {
				const lastRecord = await tsx.dailyBalance.findFirst({
					where: {
						userId: userId,
						date: {
							gte: today,
							lt: tomorrow,
						},
					},
				});

				const openingCash = lastRecord?.closingCash ?? new Prisma.Decimal(0);

				const balance = await tsx.dailyBalance.upsert({
					where: {
						userId_date: {
							userId: userId,
							date: today,
						},
					},
					update: {},
					create: {
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
				return {
					openingCash: balance.openingCash,
					closingCash: balance.closingCash,
					totalCashIn: balance.totalCashIn,
					totalCashOut: balance.totalCashOut,
					totalExpense: balance.totalExpense,
					totalSales: balance.totalSales,
				};
			});
		} catch (error) {
			console.log(error);

			throw new InternalServerErrorException("Couldn't get today's balance");
		}
	}

	async getAccountTransactions(
		userId: string,
		page: number = 1,
		limit: number = 10,
		sortBy: "createdAt" | "amount" | "type" = "createdAt",
		sortOrder: "asc" | "desc" = "desc",
	) {
		try {
			const skip = (page - 1) * limit;

			const [transactions, total] = await Promise.all([
				this.database.prisma.accountTransaction.findMany({
					where: {
						userId: userId,
					},
					orderBy: {
						[sortBy]: sortOrder,
					},
					skip: skip,
					take: limit,
					select: {
						id: true,
						type: true,
						amount: true,
						note: true,
						createdAt: true,
						updatedAt: true,
					},
				}),
				this.database.prisma.accountTransaction.count({
					where: {
						userId: userId,
					},
				}),
			]);

			const totalPages = Math.ceil(total / limit);

			return {
				data: transactions.map((t) => ({
					id: t.id,
					type: t.type,
					amount: t.amount.toString(),
					note: t.note,
					createdAt: t.createdAt,
					updatedAt: t.updatedAt,
				})),
				meta: {
					total,
					page,
					limit,
					totalPages,
					hasNext: page < totalPages,
					hasPrev: page > 1,
				},
			};
		} catch (error) {
			console.error("Error fetching transactions:", error);
			throw new InternalServerErrorException("Failed to fetch transactions");
		}
	}
}
