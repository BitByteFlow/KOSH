/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { CategoryResponseDto } from "../categories/dto/CategoryResponseDto";
import { PurchaseService } from "./purchase.service";

@Module({
    imports:[CategoryResponseDto],
    controllers:[],
    providers:[PurchaseService]
})
export class PurchaseModule{}