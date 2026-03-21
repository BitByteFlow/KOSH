import { Args, Resolver, Query, Mutation, ID } from '@nestjs/graphql';
import { PurchasesService } from './purchase.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { StoreGuard } from 'src/utils/store.guard';
import { CreatePurchaseInput } from './dto/CreatePurchaseDto.dto';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import { CurrentStore } from 'src/utils/currentStore.decorator';
import { UpdatePurchaseInput } from './dto/UpdatePurchaseDto.dto';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { Purchase } from './entities/purchase.entity';
import { PurchaseResponse } from './entities/purchaseResponse.entity';

@Resolver(() => Purchase)
@UseGuards(JwtAuthGuard, StoreGuard)
export class PurchaseResolver {
	constructor(private purchaseService: PurchasesService) {}

	@Mutation(() => PurchaseResponse, { name: 'createPurchase' })
	async createPurchase(
		@Args('createPurchaseInput') createPurchase: CreatePurchaseInput,
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<PurchaseResponse> {
		return await this.purchaseService.createPurchase(
			createPurchase,
			user.id,
			storeId,
		);
	}

	@Mutation(() => PurchaseResponse, { name: 'updatePurchase' })
	async updatePurchase(
		@Args('updatePurchase') updatePurchase: UpdatePurchaseInput,
		@Args('purchaseId', { type: () => ID }) purchaseId: string,
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<PurchaseResponse> {
		return await this.purchaseService.updatePurchase(
			updatePurchase,
			purchaseId,
			user.id,
			storeId,
		);
	}

	@Query(() => [Purchase], { name: 'getPurchases' })
	async getPurchases(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<Purchase[]> {
		return await this.purchaseService.getPurchasesByDateRange(
			user.id,
			storeId,
			startDate,
			endDate,
		);
	}
}
