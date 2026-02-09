import { Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { AccountService } from "./account.service";
import { BalanceDto } from "./dto/BalanceDto.dto";
import { CreateTransactionDto } from "./dto/CreateTransactionDto.dto";
import { GetTransactionsQueryDto } from "./dto/GetTransactionsQueryDto.dto";
import type { AuthenticatedRequest } from "src/types/auth";

@Controller("accounts/")
export class AccountController {
	constructor(private accountService: AccountService) {}

	@UseGuards(JwtAuthGuard)
	@Post("transactions")
	async createTransaction(
		@Req() req: AuthenticatedRequest,
		@Body() createTransactionDto: CreateTransactionDto,
	) {
		const response = await this.accountService.createTransaction(
			createTransactionDto,
			req.user.id,
		);

		return response;
	}
	@UseGuards(JwtAuthGuard)
	@Get("balance")
	async getCashBalance(@Req() req: AuthenticatedRequest): Promise<BalanceDto> {
		const response = await this.accountService.getCurrentCashBalance(
			req.user.id,
		);

		return response;
	}

	@UseGuards(JwtAuthGuard)
	@Get("transactions")
	async getAccountTransactions(
		@Req() req: AuthenticatedRequest,
		@Query() query: GetTransactionsQueryDto,
	) {
		const { page, limit, sortBy, sortOrder } = query;
		
		return this.accountService.getAccountTransactions(
			req.user.id,
			page,
			limit,
			sortBy,
			sortOrder,
		);
	}
}
