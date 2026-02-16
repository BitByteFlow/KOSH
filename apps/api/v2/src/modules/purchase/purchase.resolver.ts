import { Args, Resolver } from '@nestjs/graphql';
import { PurchasesService } from './purchase.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CreatePurchaseDto } from './dto/CreatePurchaseDto.dto';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import { UpdatePurchaseDto } from './dto/UpdatePurchaseDto.dto';

@Resolver()
export class PurchaseResolver {
	constructor(private purchaseService: PurchasesService) {}

	@UseGuards(JwtAuthGuard)
	async createPurchase(
		@Args('createPurchase') createPurchase: CreatePurchaseDto,
		@CurrentUser() user: any,
	) {
		const response = await this.purchaseService.createPurchase(
			createPurchase,
			user.id,
		);
		return response;
	}

	@UseGuards(JwtAuthGuard)
	async updatePurchase(
		@Args('updatePurchase') updatePurchase: UpdatePurchaseDto,
		@Args('purchaseId') purchaseId: string,
		@CurrentUser() user: any,
	): Promise<any> {
		const response = await this.purchaseService.updatePurchase(
			updatePurchase,
			purchaseId,
			user.id,
		);
		return response;
	}

	@UseGuards(JwtAuthGuard)
	async getPurchases(
		@Args('startDate') startDate: string,
		@Args('endDate') endDate: string,
		@CurrentUser() user: any,
	) {
		const purchases = await this.purchaseService.getPurchasesByDateRange(
			user.id,
			startDate,
			endDate,
		);

		return purchases;
	}
}
