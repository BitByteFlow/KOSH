import { Resolver, Query, Mutation, Args, Context, ID } from "@nestjs/graphql";
import { UseGuards } from "@nestjs/common";
import { StoreMemberService } from "./storeMember.service";
import {
	StoreMemberResponse,
	StoreMembersResponse,
} from "./entities/storeMember.entity";
import { AddMemberInput, UpdateMemberRoleInput } from "./dto/storeMember.input";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { CurrentUser } from "src/utils/currentUser.decorator";
import type { AuthenticatedUser } from "src/types/jwt.types";

@Resolver()
@UseGuards(JwtAuthGuard)
export class StoreMemberResolver {
	constructor(private readonly storeMemberService: StoreMemberService) {}

	@Mutation(() => StoreMemberResponse)
	async removeStoreMember(
		@Args("storeId", { type: () => ID }) storeId: string,
		@Args("memberId", { type: () => ID }) memberId: string,
		@CurrentUser() user: AuthenticatedUser,
	): Promise<StoreMemberResponse> {
		return this.storeMemberService.removeMember(storeId, user.id, memberId);
	}

	@Query(() => StoreMembersResponse)
	async listStoreMembers(
		@Args("storeId", { type: () => ID }) storeId: string,
	): Promise<StoreMembersResponse> {
		return this.storeMemberService.listMembers(storeId);
	}
}
