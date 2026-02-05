/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class AccountService {
    constructor(private readonly database: DatabaseService) { }

    async createTransaction(createTransactionDto, userId,) {

        await this.database.$transaction(async (tsx) => {

            const date = new Date()

            const { type, amount, note } = createTransactionDto

            await tsx.accountTransaction.create({
                data: {
                    userId: userId,
                    type: type,
                    amount: amount,
                    note: note
                }
            })


        })

    }
}