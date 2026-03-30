import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { AccountsService } from "./accounts.service";
// import { BalanceDto } from "./dto/BalanceDto.dto";
import { CreateTransactionDto } from "./dto/CreateTransactionDto.dto";
import { GetTransactionsQueryDto } from "./dto/GetTransactionQueryDto.dto";
import type { AuthenticatedRequest } from "src/types/auth";

@Controller("accounts")
export class AccountController {
	constructor(private accountService: AccountsService) {}

	@UseGuards(JwtAuthGuard)
	@Post("transactions")
	async createTransaction(
		@Req() req: AuthenticatedRequest,
		@Body() createTransactionDto: CreateTransactionDto,
	) {
		const storeId = req.headers["x-store-id"];
		if (!storeId || typeof storeId !== "string") {
			throw new BadRequestException("Store ID is required");
		}

		const response = await this.accountService.createTransaction(
			createTransactionDto,
			req.user.id,
			storeId,
		);

		return response;
	}
	// @UseGuards(JwtAuthGuard)
	// @Get("balance")
	// async getCashBalance(@Req() req: AuthenticatedRequest): Promise<BalanceDto> {
	// 	const response = await this.accountService.getCurrentCashBalance(
	// 		req.user.id,
	// 	);

	// 	return response;
	// }

	@UseGuards(JwtAuthGuard)
	@Get("transactions")
	async getAccountTransactions(
		@Req() req: AuthenticatedRequest,
		@Query() query: GetTransactionsQueryDto,
	) {
		const { page, limit, sortBy, sortOrder } = query;

		const storeId = req.headers["x-store-id"];
		if (!storeId || typeof storeId !== "string") {
			throw new BadRequestException("Store ID is required");
		}

		return this.accountService.getAccountTransactions(
			req.user.id,
			storeId,
			page,
			limit,
			sortBy,
			sortOrder,
		);
	}
}
