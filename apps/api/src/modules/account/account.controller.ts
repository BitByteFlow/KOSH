import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { AccountService } from "./account.service";
import { BalanceDto } from "./dto/BalanceDto.dto";
import { CreateTransactionDto } from "./dto/CreateTransactionDto.dto";
import type { Request } from "express";

@Controller("accounts/")
export class AccountController {
	constructor(private accountService: AccountService) {}

	@UseGuards(JwtAuthGuard)
	@Post("transactions")
	async createTransaction(
		req: Request,
		createTransactionDto: CreateTransactionDto,
	) {
		const response = await this.accountService.createTransaction(
			createTransactionDto,
			req.user.id,
		);

		return response;
	}
	@UseGuards(JwtAuthGuard)
	@Get("balance")
	async getCashBalance(@Req() req: any): Promise<BalanceDto> {
		const response = await this.accountService.getCurrentCashBalance(
			req.user.id,
		);

		return response;
	}
}
