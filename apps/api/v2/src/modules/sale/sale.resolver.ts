import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { SalesService } from "./sale.service";
import { CreateSaleInput } from "./dto/CreateSaleDto.dto";
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { Sale } from './entities/sale.entity';
import { SalesMetrics } from './entities/salesMetrics.entity';


@Resolver(() => Sale)
export class SaleResolver {
	constructor(private salesService: SalesService) {}

	@Mutation(() => Sale, { name: 'createSale' })
	@UseGuards(JwtAuthGuard)
	async createSale(
		@Args('createSaleInput') createSaleDto: CreateSaleInput,
		@CurrentUser() user: AuthenticatedUser
	): Promise<Sale> {
		return this.salesService.createSale(createSaleDto, user.id);
	}

	@Query(() => [Sale], { name: 'getSales' })
	@UseGuards(JwtAuthGuard)
	async getSales(@CurrentUser() user: AuthenticatedUser): Promise<Sale[]> {
		return this.salesService.getSales(user.id);
	}

	@Query(() => SalesMetrics, { name: 'getSalesMetrics' })
	@UseGuards(JwtAuthGuard)
	async getSalesMetrices(@CurrentUser() user: AuthenticatedUser): Promise<SalesMetrics> {
		return this.salesService.getMetrices(user.id);
	}
}
