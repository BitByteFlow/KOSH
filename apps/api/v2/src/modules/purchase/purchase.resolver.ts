import { Args, Resolver, Query, Mutation, ID } from '@nestjs/graphql';
import { PurchasesService } from './purchase.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CreatePurchaseInput } from './dto/CreatePurchaseDto.dto';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import { UpdatePurchaseInput } from './dto/UpdatePurchaseDto.dto';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { Purchase } from './entities/purchase.entity';
import { PurchaseResponse } from './entities/purchaseResponse.entity';

@Resolver(() => Purchase)
	@UseGuards(JwtAuthGuard)
export class PurchaseResolver {
	constructor(private purchaseService: PurchasesService) {}

	@Mutation(() => PurchaseResponse, { name: 'createPurchase' })
	async createPurchase(
		@Args('createPurchase') createPurchase: CreatePurchaseInput,
		@CurrentUser() user: AuthenticatedUser,
	): Promise<PurchaseResponse> {
		return await this.purchaseService.createPurchase(
			createPurchase,
			user.id,
		);
	}

	@Mutation(() => PurchaseResponse, { name: 'updatePurchase' })
	async updatePurchase(
		@Args('updatePurchase') updatePurchase: UpdatePurchaseInput,
		@Args('purchaseId', { type: () => ID }) purchaseId: string,
		@CurrentUser() user: AuthenticatedUser,
	): Promise<PurchaseResponse> {
		return await this.purchaseService.updatePurchase(
			updatePurchase,
			purchaseId,
			user.id,
		);
	}

	@Query(() => [Purchase], { name: 'getPurchases' })
	async getPurchases(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: AuthenticatedUser,
	): Promise<Purchase[]> {
		return await this.purchaseService.getPurchasesByDateRange(
			user.id,
			startDate,
			endDate,
		);
	}
}
