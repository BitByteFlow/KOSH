import { Args, Resolver } from '@nestjs/graphql';
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { SalesService } from "./sale.service";
import { CreateSaleDto } from "./dto/CreateSaleDto.dto";
import { CurrentUser } from 'src/utils/currentUser.decorator';


@Resolver()
export class SaleResolver {
	constructor(private salesService: SalesService) {}

	@UseGuards(JwtAuthGuard)
	async createSale(
		@Args('createSaleDto') createSaleDto: CreateSaleDto,
		@CurrentUser() user: any
	) {
		return this.salesService.createSale(createSaleDto, user.id);
	}

	@UseGuards(JwtAuthGuard)
	async getSales(@CurrentUser() user: any) {
		return this.salesService.getSales(user.id);
	}
	@UseGuards(JwtAuthGuard)
	async getSalesMetrices(@CurrentUser() user: any) {
		return this.salesService.getMetrices(user.id);
	}
}
