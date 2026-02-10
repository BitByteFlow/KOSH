import type { Prisma } from "@kosh/db";

export class BalanceDto {
	openingCash!: Prisma.Decimal;
	closingCash!: Prisma.Decimal;
	totalSales!: Prisma.Decimal;
	totalExpense!: Prisma.Decimal;
	totalCashIn!: Prisma.Decimal;
	totalCashOut!: Prisma.Decimal;
}
