/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { CategoryResponseDto } from "../categories/dto/CategoryResponseDto";
import { ProductService } from "../product/product.service";
import { PurchaseController } from "./purchase.controller";
import { PurchasesService } from "./purchase.service";

@Module({
    imports:[CategoryResponseDto],
    controllers:[PurchaseController],
    providers:[PurchasesService,ProductService]
})
export class PurchaseModule{}