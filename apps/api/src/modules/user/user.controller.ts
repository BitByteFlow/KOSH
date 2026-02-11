import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import type { UserResponseDto } from "./dto/UserResponseDto";
import { UserService } from "./user.service";
import type { AuthenticatedRequest } from "src/types/auth";

@Controller("users")
export class UserController {
	constructor(private userService: UserService) {}

	@UseGuards(JwtAuthGuard)
	@Get("me")
	async getCurrentUser(
		@Req() req: AuthenticatedRequest,
	): Promise<UserResponseDto> {
		const response = await this.userService.getCurrentUser(req.user.id);
		return response;
	}
}
