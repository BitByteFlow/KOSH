import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { DatabaseService } from "src/database/database.service";
import { AuthResponseDto } from "./dto/AuthResponseDto";

@Injectable()
export class AuthService {
	constructor(
		private readonly database: DatabaseService,
		private readonly jwtService: JwtService,
	) {}

	async createUser(
		email: string,
		googleId: string,
		image: string,
		username: string,
	): Promise<AuthResponseDto> {
		const existinguser = await this.database.user.findFirst({
			where: {
				OR: [
					{ email: email },
					{
						googleId: {
							not: null,
							equals: googleId,
						},
					},
				],
			},
		});

		if (existinguser) {
			throw new UnauthorizedException(
				"User already exists with this email and user Id",
			);
		}

		const user = await this.database.user.create({
			data: {
				googleId: googleId,
				email: email,
				image: image,
				username: username,
			},
		});

		const token = this.jwtService.sign({
			sub: user.id,
			email: user.email,
			username: user.username,
		});

		return {
			token: token,
		};
	}

    //TODO: NOT valid remove later
	async getUser(email: string, googleId: string): Promise<AuthResponseDto> {
		const existinguser = await this.database.user.findFirst({
			where: {
				OR: [
					{ email: email },
					{
						googleId: {
							not: null,
							equals: googleId,
						},
					},
				],
			},
		});

		if (!existinguser) {
			throw new UnauthorizedException(
				"User doesn't exist with this email and googleId",
			);
		}

		const token = this.jwtService.sign({
			sub: existinguser.id,
			email: existinguser.email,
			username: existinguser.username,
		});

		return {
			token: token,
		};
	}
}
