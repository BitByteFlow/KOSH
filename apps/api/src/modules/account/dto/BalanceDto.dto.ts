/* eslint-disable prettier/prettier */

import { Decimal } from "db/generated/prisma/runtime/client"

export class BalanceDto{

    openingCash:Decimal
    closingCash:Decimal
    totalSales:Decimal
    totalExpense:Decimal
    totalCashIn:Decimal
    totalCashOut:Decimal
}