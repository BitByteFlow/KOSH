/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { CreatePurchaseDto } from "./dto/CreatePurchaseDto.dto";
import { GetPurchaseFilter } from "./dto/GetPurchaseDto.dto";
import { UpdatePurchaseDto } from "./dto/UpdatePurchaseDto.dto";
import { PurchasesService } from "./purchase.service";
@Controller('purchases')
export class PurchaseController {

    constructor(private purchaseService: PurchasesService) { }

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post("")
    async createPurchase(@Req() req, @Body() createPurchase: CreatePurchaseDto) {

        const response = await this.purchaseService.createPurchase(createPurchase, req.user.id)
        return response

    }
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Patch(":purchaseId")
    async updatePurchase(@Req() req, @Param('purchaseId', ParseUUIDPipe) purchaseId, @Body() updatePurchase: UpdatePurchaseDto): Promise<any> {

        const response = await this.purchaseService.updatePurchase(updatePurchase, purchaseId, req.user.id)
        return response

    }
    

    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    @Get()
    async getPurchases(@Req() req, @Query() query: GetPurchaseFilter) {
        const purchases = await this.purchaseService.getPurchasesByDateRange(req.user.id, query.from, query.to);

        return purchases
    }
}