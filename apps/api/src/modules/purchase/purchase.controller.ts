import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import type { CreatePurchaseDto } from "./dto/CreatePurchaseDto.dto";
import type { GetPurchaseFilter } from "./dto/GetPurchaseDto.dto";
import type { UpdatePurchaseDto } from "./dto/UpdatePurchaseDto.dto";
import type { PurchasesService } from "./purchase.service";
import type { AuthenticatedRequest } from "src/types/auth";
@Controller("purchases")
export class PurchaseController {
	constructor(private purchaseService: PurchasesService) {}

	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	@Post("")
	async createPurchase(
		@Req() req: AuthenticatedRequest,
		@Body() createPurchase: CreatePurchaseDto,
	) {
		const response = await this.purchaseService.createPurchase(
			createPurchase,
			req.user.id,
		);
		return response;
	}
	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	@Patch(":purchaseId")
	async updatePurchase(
		@Req() req: AuthenticatedRequest,
		@Param("purchaseId", ParseUUIDPipe) purchaseId: string,
		@Body() updatePurchase: UpdatePurchaseDto,
	): Promise<any> {
		const response = await this.purchaseService.updatePurchase(
			updatePurchase,
			purchaseId,
			req.user.id,
		);
		return response;
	}

	@UseGuards(JwtAuthGuard)
	@HttpCode(HttpStatus.CREATED)
	@Get()
	async getPurchases(
		@Req() req: AuthenticatedRequest,
		@Query() query: GetPurchaseFilter,
	) {
		const purchases = await this.purchaseService.getPurchasesByDateRange(
			req.user.id,
			query.from,
			query.to,
		);

		return purchases;
	}
}
