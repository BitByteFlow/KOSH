import { LoginRequestDto } from "./dto/LoginRequestDto";
import { Body, Controller, Get, Post, Req, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { CreateUserDto } from "./dto/CreateUserDto";
import type { Response } from "express";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("register")
	async register(
		@Body() authPayLoad: CreateUserDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthResponseDto> {
		const response = await this.authService.createUser(
			authPayLoad.email,
			authPayLoad.googleId,
			authPayLoad.image,
			authPayLoad.username,
			authPayLoad.isCashier,
		);
		res.cookie("kosh_access_token", response.token, {
			maxAge: 33333333,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});
		return response;
	}

	@Post("login")
	async login(
		@Body() authPayLoad: LoginRequestDto,
		@Res({ passthrough: true }) res: Response,
	): Promise<AuthResponseDto> {
		const response = await this.authService.signin(
			authPayLoad.email,
			authPayLoad.googleId,
			authPayLoad.isCashier,
		);
		res.cookie("kosh_access_token", response.token, {
			maxAge: 33333333,
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
		});
		return response;
	}

	@Post("logout")
	async logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie("kosh_access_token");
		return { message: "Logged out successfully" };
	}
}
