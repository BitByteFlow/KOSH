import { LoginRequestDto } from "./dto/LoginRequestDto";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { CreateUserDto } from "./dto/CreateUserDto";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) { }

	@Post("register")
	async register(@Body() authPayLoad: CreateUserDto): Promise<AuthResponseDto> {
		console.log("authPayLoad", authPayLoad)
		const response = await this.authService.createUser(
			authPayLoad.email,
			authPayLoad.googleId,
			authPayLoad.image,
			authPayLoad.username,
			authPayLoad.isCashier,
		);
		return response;
	}

	@Post("login")
	async login(@Body() authPayLoad: LoginRequestDto): Promise<AuthResponseDto> {
		console.log("auth payload in login", authPayLoad)
		const response = await this.authService.signin(
			authPayLoad.email,
			authPayLoad.googleId,
			authPayLoad.isCashier,
		);
		return response;
	}
}
