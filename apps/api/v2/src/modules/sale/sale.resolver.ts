import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { SalesService } from "./sale.service";
import { CreateSaleInput } from "./dto/CreateSaleDto.dto";
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { Sale, SaleResponse } from './entities/sale.entity';
import { SalesMetricsResponse } from './entities/salesMetrics.entity';


@Resolver(() => Sale)
export class SaleResolver {
	constructor(private salesService: SalesService) { }

	@Mutation(() => SaleResponse, { name: 'createSale' })
	@UseGuards(JwtAuthGuard)
	async createSale(
		@Args('createSaleInput') createSaleDto: CreateSaleInput,
		@CurrentUser() user: AuthenticatedUser
	): Promise<SaleResponse> {
		return this.salesService.createSale(createSaleDto, user.id);
	}

	@Query(() => SaleResponse, { name: 'getSales' })
	@UseGuards(JwtAuthGuard)
	async getSales(@CurrentUser() user: AuthenticatedUser): Promise<SaleResponse> {
		return await this.salesService.getSales(user.id);
	}

	@Query(() => SalesMetricsResponse, { name: 'getSalesMetrics' })
	@UseGuards(JwtAuthGuard)
	async getSalesMetrics(@CurrentUser() user: AuthenticatedUser): Promise<SalesMetricsResponse> {
		return await this.salesService.getMetrices(user.id);
	}
}
