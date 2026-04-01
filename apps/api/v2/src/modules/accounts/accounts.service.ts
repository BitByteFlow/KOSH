import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BalanceResponse } from './entities/balance.entity';
import { PaginatedTransactionsResponse } from './entities/paginatedTransactions.entity';
import { Prisma } from '@kosh/db';
import { CreateTransactionInput } from './dto/createTransaction.dto';
import { AccountResponse, UpdateAccountTransactionResponse } from './entities/account.entity';
import { UpdateTransactionInput } from './dto/updateTransaction.dto';

@Injectable()
export class AccountsService {
  constructor(private readonly database: DatabaseService) { }
  async createTransaction(
    createTransactionDto: CreateTransactionInput,
    userId: string,
    storeId: string,
  ): Promise<AccountResponse> {
    const { type, amount: rawAmount, note } = createTransactionDto;

    const amount = new Prisma.Decimal(rawAmount);

    if (amount.lte(0)) {
      throw new BadRequestException("Amount must be positive");
    }

    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
    const tomorrow = new Date(today);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const todayStr = today.toISOString().split("T")[0];

    return this.database.prisma.$transaction(async (tsx: Prisma.TransactionClient) => {
      // Lock the store record to serialize balance updates
      await tsx.$executeRaw`SELECT 1 FROM "Store" WHERE id = ${storeId} FOR UPDATE`;

      const hasAnyBalanceToday = await tsx.dailyBalance.count({
        where: {
          storeId,
          date: todayStr,
        },
      });

      const hasAnyHistoricalBalance = await tsx.dailyBalance.count({
        where: {
          storeId,
        },
      });

      if (hasAnyBalanceToday === 0 && hasAnyHistoricalBalance === 0 && type !== "INITIAL_CAPITAL") {
        throw new ConflictException("First transaction of the day must be INITIAL_CAPITAL");
      }

      if (hasAnyBalanceToday > 0 && type === "INITIAL_CAPITAL") {
        throw new ConflictException("INITIAL_CAPITAL can only be recorded once per day");
      }

      let dailyBalance = await tsx.dailyBalance.findFirst({
        where: {
          storeId,
          date: todayStr,
        },
      });

      let isFirstTransactionOfDay = !dailyBalance;

      if (!dailyBalance) {
        const lastRecord = await tsx.dailyBalance.findFirst({
          where: { storeId },
          orderBy: { date: "desc" },
        });

        let openingCash = lastRecord?.closingCash ?? new Prisma.Decimal(0);

        if (type === "INITIAL_CAPITAL") {
          openingCash = openingCash.add(amount);
        }

        if (
          ["WITHDRAWAL", "PURCHASE", "EXPENSES", "DEBT_PAID"].includes(type) &&
          amount.gt(openingCash)
        ) {
          throw new ConflictException(
            `Insufficient funds for ${type.toLowerCase()}. Available: ${openingCash}, Required: ${amount}`,
          );
        }

        dailyBalance = await tsx.dailyBalance.create({
          data: {
            storeId,
            date: todayStr,
            openingCash,
            closingCash: openingCash,
            totalCashIn: type === "INITIAL_CAPITAL" ? amount : new Prisma.Decimal(0),
            totalCashOut: new Prisma.Decimal(0),
            totalSales: new Prisma.Decimal(0),
            totalExpense: new Prisma.Decimal(0),
          },
        });
      } else {
        const currentBalance = new Prisma.Decimal(dailyBalance.closingCash);
        if (
          ["WITHDRAWAL", "PURCHASE", "EXPENSES", "DEBT_PAID"].includes(type) &&
          amount.gt(currentBalance)
        ) {
          throw new ConflictException(
            `Insufficient funds for ${type.toLowerCase()}. Available: ${currentBalance}, Required: ${amount}`,
          );
        }
      }

      // Now apply the transaction effect (unless it's INITIAL_CAPITAL on first tx — already set)
      const updateData: Prisma.DailyBalanceUpdateInput = {};

			const isInitialCapitalFirstTx = isFirstTransactionOfDay && type === "INITIAL_CAPITAL";

			if (isInitialCapitalFirstTx) {
				updateData.closingCash = amount;
				updateData.totalCashIn = amount;
			} else {
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
						if (["PURCHASE", "EXPENSES", "DEBT_PAID"].includes(type)) {
							updateData.totalExpense = { increment: amount };
						}
						break;

					default:
						throw new BadRequestException(`Invalid transaction type: ${type}`);
				}
			}

      if (Object.keys(updateData).length > 0) {
        await tsx.dailyBalance.update({
          where: { id: dailyBalance!.id },
          data: updateData,
        });
      }

      const transaction = await tsx.accountTransaction.create({
        data: {
          storeId,
          type,
          amount,
          note,
          dailyBalanceId: dailyBalance.id,
        },
      });

      return {
        success: true,
        message: "Transaction created successfully",
        data: {
          ...transaction,
          amount: transaction.amount.toNumber(),
          note: transaction.note || undefined,
        },
      };
    }).catch((error) => {
      if (error.code === "P2002") {
        throw new ConflictException("Concurrent transaction detected. Please try again.");
      }
      throw error;
    });
  }

  async getCurrentCashBalance(userId: string, storeId: string): Promise<BalanceResponse> {
    try {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];

      return await this.database.prisma.$transaction(async (tsx) => {
        const lastRecord = await tsx.dailyBalance.findFirst({
          where: {
            storeId,
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
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
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
      const transaction = await this.database.prisma.accountTransaction.findUnique({
        where: {
          id: transactionId,
          storeId
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

      const updatedTransaction = await this.database.prisma.accountTransaction.update({
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
