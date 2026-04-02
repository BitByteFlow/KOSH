import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { DatabaseService } from "../../database/database.service";
import { BalanceResponse } from "./entities/balance.entity";
import { PaginatedTransactionsResponse } from "./entities/paginatedTransactions.entity";
import { Prisma, TransactionType } from "@kosh/db";
import { CreateTransactionInput } from "./dto/createTransaction.dto";
import {
	AccountResponse,
	UpdateAccountTransactionResponse,
} from "./entities/account.entity";
import { UpdateTransactionInput } from "./dto/updateTransaction.dto";

@Injectable()
export class AccountsService {
	constructor(private readonly database: DatabaseService) {}

	async createTransaction(
		dto: CreateTransactionInput,
		userId: string,
		storeId: string,
	): Promise<AccountResponse> {
		const { type, amount: rawAmount, note } = dto;
		const amount = new Prisma.Decimal(rawAmount);

		if (amount.lte(0)) {
			throw new BadRequestException(
				"Transaction amount must be greater than zero.",
			);
		}

		const todayStr = new Date().toISOString().split("T")[0];

		const isCashIn = [
			"ADDITIONAL_CAPITAL",
			"SALE_INCOME",
			"CREDIT_RECEIVED",
		].includes(type);
		const isCashOut = [
			"WITHDRAWAL",
			"PURCHASE",
			"DEBT_PAID",
			"EXPENSES",
		].includes(type);
		const isNonCash = ["CREDIT", "DEBT", "ADJUSTMENT"].includes(type);

		if (!isCashIn && !isCashOut && !isNonCash && type !== "INITIAL_CAPITAL") {
			throw new BadRequestException(`Invalid transaction type: ${type}`);
		}

		try {
			return await this.database.prisma.$transaction(
				async (tx) => {
					const dailyBalance = await tx.dailyBalance.findFirst({
						where: { storeId, date: todayStr },
					});

					const isFirstTxOfDay = !dailyBalance;

					if (isFirstTxOfDay && type !== "INITIAL_CAPITAL") {
						throw new ConflictException(
							"The first transaction of the day must be INITIAL_CAPITAL to set the opening balance.",
						);
					}

					if (!isFirstTxOfDay && type === "INITIAL_CAPITAL") {
						throw new ConflictException(
							"INITIAL_CAPITAL can only be recorded once per day as the first transaction.",
						);
					}

					let dailyBalanceId: string;

					if (isFirstTxOfDay) {
						const created = await tx.dailyBalance.create({
							data: {
								storeId,
								date: todayStr,
								openingCash: amount,
								closingCash: amount,
								totalCashIn: new Prisma.Decimal(0),
								totalCashOut: new Prisma.Decimal(0),
								totalSales: new Prisma.Decimal(0),
								totalExpense: new Prisma.Decimal(0),
							},
						});
						dailyBalanceId = created.id;
					} else {
						dailyBalanceId = dailyBalance.id;

						const currentClosing = new Prisma.Decimal(dailyBalance.closingCash);
						if (isCashOut && amount.gt(currentClosing)) {
							throw new ConflictException(
								`Insufficient funds for ${type}. Available: ${currentClosing.toFixed(2)}, Required: ${amount.toFixed(2)}`,
							);
						}
					}

					let cashInDelta = new Prisma.Decimal(0);
					let cashOutDelta = new Prisma.Decimal(0);
					let salesDelta = new Prisma.Decimal(0);
					let expenseDelta = new Prisma.Decimal(0);

					if (!isFirstTxOfDay) {
						if (isCashIn) {
							cashInDelta = amount;
							if (["SALE_INCOME", "CREDIT_RECEIVED"].includes(type)) {
								salesDelta = amount;
							}
						} else if (isCashOut) {
							cashOutDelta = amount;
							if (["PURCHASE", "EXPENSES", "DEBT_PAID"].includes(type)) {
								expenseDelta = amount;
							}
						}
					}

					if (
						cashInDelta.gt(0) ||
						cashOutDelta.gt(0) ||
						salesDelta.gt(0) ||
						expenseDelta.gt(0)
					) {
						await tx.dailyBalance.update({
							where: { id: dailyBalanceId },
							data: {
								closingCash: { increment: cashInDelta.minus(cashOutDelta) },
								totalCashIn: { increment: cashInDelta },
								totalCashOut: { increment: cashOutDelta },
								totalSales: { increment: salesDelta },
								totalExpense: { increment: expenseDelta },
							},
						});
					}

					const transaction = await tx.accountTransaction.create({
						data: {
							storeId,
							type: type as TransactionType,
							amount,
							note,
							dailyBalanceId,
						},
					});

					return {
						success: true,
						message: "Transaction recorded successfully",
						data: {
							id: transaction.id,
							type: transaction.type,
							amount: transaction.amount.toNumber(),
							note: transaction.note || undefined,
							createdAt: transaction.createdAt,
							updatedAt: transaction.updatedAt,
						},
					};
				},
				{
					isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
					timeout: 10000,
				},
			);
		} catch (error) {
			if (error.code === "P2002") {
				throw new ConflictException(
					"Daily balance record already exists. Please refresh and retry.",
				);
			}
			if (error.code === "P2034") {
				throw new ConflictException(
					"Transaction timed out due to high concurrency. Please retry.",
				);
			}
			if (
				error instanceof BadRequestException ||
				error instanceof ConflictException
			)
				throw error;

			console.error("Unexpected error in createTransaction:", error);
			throw new InternalServerErrorException(
				"Failed to process transaction. Please try again later.",
			);
		}
	}
	async getCurrentCashBalance(
		userId: string,
		storeId: string,
	): Promise<BalanceResponse> {
		try {
			const now = new Date();
			const todayStr = now.toISOString().split("T")[0];

			return await this.database.prisma.$transaction(async (tsx) => {
				const lastRecord = await tsx.dailyBalance.findFirst({
					where: {
						storeId,
						date: todayStr,
					},
					orderBy: {
						date: "desc",
					},
				});

				return {
					success: true,
					message: "Today's balance retrieved successfully",
					data: {
						openingCash: lastRecord?.openingCash.toNumber() ?? 0,
						closingCash: lastRecord?.closingCash.toNumber() ?? 0,
						totalCashIn: lastRecord?.totalCashIn.toNumber() ?? 0,
						totalCashOut: lastRecord?.totalCashOut.toNumber() ?? 0,
						totalExpense: lastRecord?.totalExpense.toNumber() ?? 0,
						totalSales: lastRecord?.totalSales.toNumber() ?? 0,
					},
				};
			});
		} catch (error) {
			console.log(error);
			throw new InternalServerErrorException("Couldn't get today's balance");
		}
	}

	async getAccountTransactions(
		userId: string,
		storeId: string,
		page: number = 1,
		limit: number = 10,
		sortBy: "createdAt" | "amount" | "type" = "createdAt",
		sortOrder: "asc" | "desc" = "desc",
	): Promise<PaginatedTransactionsResponse> {
		try {
			const skip = (page - 1) * limit;
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

			const [transactions, total] = await Promise.all([
				this.database.prisma.accountTransaction.findMany({
					where: {
						storeId,
						createdAt: {
							gte: today,
							lt: tomorrow,
						},
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
						storeId,
						createdAt: {
							gte: today,
							lt: tomorrow,
						},
					},
				}),
			]);

			const totalPages = Math.ceil(total / limit);
			return {
				success: true,
				message: "Transactions fetched successfully",
				data: transactions.map((t) => ({
					id: t.id,
					type: t.type,
					amount: t.amount.toNumber(),
					note: t.note || undefined,
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

	async updateAccountTransaction(
		transactionId: string,
		updateTransactionDto: UpdateTransactionInput,
		userId: string,
		storeId: string,
	): Promise<UpdateAccountTransactionResponse> {
		try {
			const transaction =
				await this.database.prisma.accountTransaction.findUnique({
					where: {
						id: transactionId,
						storeId,
					},
				});

			if (!transaction) {
				throw new NotFoundException("Transaction not found");
			}

			// Removed userId check as AccountTransaction is now store-scoped
			/*
      if (transaction.userId !== userId) {
        throw new ForbiddenException("You are not authorized to update this transaction");
      }
      */

			const updatedTransaction =
				await this.database.prisma.accountTransaction.update({
					where: {
						id: transactionId,
					},
					data: {
						//TODO: update the logic and make it type safe
						type: updateTransactionDto.type as any,
						amount: updateTransactionDto.amount,
						note: updateTransactionDto.note,
					},
				});

			return {
				success: true,
				message: "Transaction updated successfully",
				data: {
					...updatedTransaction,
					amount: updatedTransaction.amount.toNumber(),
					note: updatedTransaction.note || undefined,
					updatedAt: updatedTransaction.updatedAt,
					createdAt: updatedTransaction.createdAt,
					id: updatedTransaction.id,
					type: updatedTransaction.type,
				},
			};
		} catch (error) {
			console.error("Error updating transaction:", error);
			if (
				error instanceof NotFoundException ||
				error instanceof ConflictException ||
				error instanceof BadRequestException
			) {
				throw error;
			}
			throw new InternalServerErrorException(
				`Failed to update transaction: ${error.message}`,
			);
		}
	}
}
