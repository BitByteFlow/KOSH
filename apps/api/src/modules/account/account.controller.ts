/* eslint-disable prettier/prettier */
import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { AccountService } from "./account.service";
import { CreateTransactionDto } from "./dto/CreateTransactionDto.dto";

@Controller('accounts/')
export class AccountController {

    constructor(private accountService:AccountService){}

    @UseGuards(JwtAuthGuard)
    @Post('transactions')
    async createTransaction(@Req() req:any, @Body() createTransactionDto:CreateTransactionDto){

        const response = await this.accountService.createTransaction(createTransactionDto,req.user.id)

        return response;
    }
}