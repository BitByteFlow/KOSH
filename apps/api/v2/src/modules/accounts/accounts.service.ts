import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BalanceResponse } from './entities/balance.entity';
import { PaginatedTransactionsResponse } from './entities/paginatedTransactions.entity';
import { Prisma } from '@kosh/db';
import { CreateTransactionInput } from './dto/createTransaction.dto';
import { AccountResponse } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(private readonly database: DatabaseService) { }
  async createTransaction(
    createTransactionDto: CreateTransactionInput,
    userId: string,
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

    return this.database.prisma.$transaction(async (tsx) => {
      const hasAnyBalanceToday = await tsx.dailyBalance.count({
        where: {
          userId,
          date: { gte: today, lt: tomorrow },
        },
      });

      if (hasAnyBalanceToday === 0 && type !== "INITIAL_CAPITAL") {
        throw new ConflictException("First transaction of the day must be INITIAL_CAPITAL");
      }

      if (hasAnyBalanceToday > 0 && type === "INITIAL_CAPITAL") {
        throw new ConflictException("INITIAL_CAPITAL can only be recorded once per day");
      }

      let dailyBalance = await tsx.dailyBalance.findFirst({
        where: {
          userId,
          date: { gte: today, lt: tomorrow },
        },
      });

      let isFirstTransactionOfDay = !dailyBalance;

      if (!dailyBalance) {
        let openingCash = new Prisma.Decimal(0);

        if (type === "INITIAL_CAPITAL") {
          openingCash = amount;
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
            userId,
            date: today,
            openingCash,
            closingCash: openingCash,
            totalCashIn: new Prisma.Decimal(0),
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

      if (!isInitialCapitalFirstTx) {
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
          where: { id: dailyBalance.id },
          data: updateData,
        });
      }

      const transaction = await tsx.accountTransaction.create({
        data: {
          userId,
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

  /**
   * Retrieves the current day's cash balance for a user.
   * If no balance exists for today, creates one using yesterday's closing balance as opening balance.
   *
   * @param userId - User ID from authenticated session
   * @returns BalanceDto containing opening/closing cash, total cash in/out, sales, and expenses
   * @throws InternalServerErrorException - If database operation fails
   */
  async getCurrentCashBalance(userId: string): Promise<BalanceResponse> {
    try {
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      const tomorrow = new Date(today);
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

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
          success: true,
          message: "Today's balance retrieved successfully",
          data: {
            openingCash: balance.openingCash.toNumber(),
            closingCash: balance.closingCash.toNumber(),
            totalCashIn: balance.totalCashIn.toNumber(),
            totalCashOut: balance.totalCashOut.toNumber(),
            totalExpense: balance.totalExpense.toNumber(),
            totalSales: balance.totalSales.toNumber(),
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
            userId: userId,
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
            userId: userId,
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
}
