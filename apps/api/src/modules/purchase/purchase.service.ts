/* eslint-disable prettier/prettier */
import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";

@Injectable()
export class PurchaseService {
    constructor(private readonly database: DatabaseService) { }

    async createPurchase() {

    }

}
