import { Args, Resolver, Query, Mutation } from '@nestjs/graphql';
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { SalesService } from "./sale.service";
import { CreateSaleInput } from "./dto/CreateSaleDto.dto";
import { CurrentUser } from 'src/utils/currentUser.decorator';
import { CurrentStore } from 'src/utils/currentStore.decorator';
import { StoreGuard } from 'src/utils/store.guard';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { Sale, SaleResponse } from './entities/sale.entity';
import { SalesMetricsResponse } from './entities/salesMetrics.entity';


@Resolver(() => Sale)
export class SaleResolver {
	constructor(private salesService: SalesService) { }

	@Mutation(() => SaleResponse, { name: 'createSale' })
	@UseGuards(JwtAuthGuard, StoreGuard)
	async createSale(
		@Args('createSaleInput') createSaleDto: CreateSaleInput,
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string
	): Promise<SaleResponse> {
		return this.salesService.createSale(createSaleDto, user.id, storeId);
	}

	@Query(() => SaleResponse, { name: 'getSales' })
	@UseGuards(JwtAuthGuard, StoreGuard)
	async getSales(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string
	): Promise<SaleResponse> {
		return await this.salesService.getSales(user.id, storeId);
	}

	@Query(() => SalesMetricsResponse, { name: 'getSalesMetrics' })
	@UseGuards(JwtAuthGuard, StoreGuard)
	async getSalesMetrics(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string
	): Promise<SalesMetricsResponse> {
		return await this.salesService.getMetrices(user.id, storeId);
	}
}
