import type { LoginRequestDto } from "./dto/LoginRequestDto";
import { Body, Controller, Get, Post } from "@nestjs/common";
import type { AuthService } from "./auth.service";
import type { AuthResponseDto } from "./dto/AuthResponseDto";
import type { CreateUserDto } from "./dto/CreateUserDto";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post("register")
	async register(@Body() authPayLoad: CreateUserDto): Promise<AuthResponseDto> {
		const response = await this.authService.createUser(
			authPayLoad.email,
			authPayLoad.googleId,
			authPayLoad.image,
			authPayLoad.username,
		);
		return response;
	}

	@Post("login")
	async login(@Body() authPayLoad: LoginRequestDto): Promise<AuthResponseDto> {
		console.log(authPayLoad);
		const response = await this.authService.signin(
			authPayLoad.email,
			authPayLoad.googleId,
		);
		return response;
	}
}
