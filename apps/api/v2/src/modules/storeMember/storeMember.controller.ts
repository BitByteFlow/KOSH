import { Controller, Post, Body, UseGuards, Req } from "@nestjs/common";
import { StoreMemberService } from "./storeMember.service";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import type { AuthenticatedUser } from "src/types/jwt.types";
import { StoreMemberResponse } from "./entities/storeMember.entity";

@Controller("storeMember")
@UseGuards(JwtAuthGuard)
export class StoreMemberController {
	constructor(private readonly storeMemberService: StoreMemberService) { }

	@Post("onboarding")
	async onboarding(
		@Body() body: { storeId: string },
		@Req() req: { user: AuthenticatedUser }
	): Promise<StoreMemberResponse> {
		return this.storeMemberService.onBoarding(body.storeId, req.user.id);
	}
}