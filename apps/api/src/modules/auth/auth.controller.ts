import { LoginRequestDto } from "./dto/LoginRequestDto";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { CreateUserDto } from "./dto/CreateUserDto";

@Controller("auths")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post()
	async register(@Body() authPayLoad: CreateUserDto): Promise<AuthResponseDto> {
		const response = await this.authService.createUser(
			authPayLoad.email,
			authPayLoad.googleId,
			authPayLoad.image,
			authPayLoad.username,
		);
		return response;
	}

	@Get()
	async login(@Body() authPayLoad: LoginRequestDto): Promise<AuthResponseDto> {
		console.log(authPayLoad);
		const response = await this.authService.signin(
			authPayLoad.email,
			authPayLoad.googleId,
		);
		return response;
	}
}
