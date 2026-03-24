import { Resolver, Query, Mutation, Args, Context, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { StoreJoinRequestService } from "./storeJoinRequest.service";
import {
	StoreJoinRequestResponse,
	StoreJoinRequestsResponse,
} from "./entities/storeJoinRequest.entity";
import { HandleJoinRequestInput } from "./dto/storeJoinRequest.input";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { CurrentUser } from "src/utils/currentUser.decorator";
import { CurrentStore } from "src/utils/currentStore.decorator";
import type { AuthenticatedUser } from "src/types/jwt.types";

@Resolver()
@UseGuards(JwtAuthGuard)
export class StoreJoinRequestResolver {
	constructor(
		private readonly storeJoinRequestService: StoreJoinRequestService,
	) {}

	@Query(() => StoreJoinRequestsResponse)
	async getPendingJoinRequests(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<StoreJoinRequestsResponse> {
		return this.storeJoinRequestService.getPendingJoinRequests(storeId);
	}

	@Query(() => StoreJoinRequestsResponse)
	async getAllJoinRequests(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<StoreJoinRequestsResponse> {
		return this.storeJoinRequestService.getAllJoinRequests(storeId);
	}

	@Query(() => StoreJoinRequestResponse)
	async getUserJoinRequest(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<StoreJoinRequestResponse> {
		return this.storeJoinRequestService.getUserJoinRequest(storeId, user.id);
	}

	@Mutation(() => StoreJoinRequestResponse)
	async createJoinRequest(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<StoreJoinRequestResponse> {
		return this.storeJoinRequestService.createJoinRequest(storeId, user.id);
	}

	@Mutation(() => StoreJoinRequestResponse)
	async handleJoinRequest(
		@CurrentUser() user: AuthenticatedUser,
		// @CurrentStore() storeId: string,
		@Args("requestId", { type: () => ID }) requestId: string,
		@Args("input") input: HandleJoinRequestInput,
	): Promise<StoreJoinRequestResponse> {
		return this.storeJoinRequestService.handleJoinRequest(
			requestId,
			input,
			user.id,
		);
	}

	@Mutation(() => StoreJoinRequestResponse)
	async cancelJoinRequest(
		@CurrentUser() user: AuthenticatedUser,
		@CurrentStore() storeId: string,
	): Promise<StoreJoinRequestResponse> {
		return this.storeJoinRequestService.cancelJoinRequest(storeId, user.id);
	}
}
