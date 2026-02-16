import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { SalesService } from "./sales.service";
import { CreateSaleDto } from "./dto/CreateSaleDto.dto";
import type { AuthenticatedRequest } from "src/types/auth";

@Controller("sales")
export class SalesController {
	constructor(private salesService: SalesService) {}

	@UseGuards(JwtAuthGuard)
	@Post()
	async createSale(
		@Req() req: AuthenticatedRequest,
		@Body() createSaleDto: CreateSaleDto,
	) {
		return this.salesService.createSale(createSaleDto, req.user.id);
	}

	@UseGuards(JwtAuthGuard)
	@Get()
	async getSales(@Req() req: AuthenticatedRequest) {
		return this.salesService.getSales(req.user.id);
	}
	@UseGuards(JwtAuthGuard)
	@Get("todays-metrices")
	async getSalesMetrices(@Req() req: AuthenticatedRequest) {
		return this.salesService.getMetrices(req.user.id);
	}
}
