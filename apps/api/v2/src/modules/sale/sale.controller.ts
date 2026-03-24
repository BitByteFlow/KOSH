import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { SalesService } from "./sale.service";
import type { CreateSaleInput } from "./dto/CreateSaleDto.dto";
import type { AuthenticatedRequest } from "src/types/auth";

@Controller("sales")
export class SalesController {
	constructor(private salesService: SalesService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	async createSale(
		@Req() req: AuthenticatedRequest,
		@Body() createSaleDto: CreateSaleInput,
	) {
		return this.salesService.createSale(createSaleDto, req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	//TODO: not from body, instea x-store-id header
	async getSales(@Req() req: AuthenticatedRequest) {
		return this.salesService.getSales(req.user.id, req.body.storeId);
	}
}
