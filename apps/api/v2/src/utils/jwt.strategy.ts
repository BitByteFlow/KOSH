import { Injectable, UnauthorizedException, Inject } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "src/database/database.service";
import type { JwtPayload, AuthenticatedUser } from "../types/jwt.types";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
	constructor(
		private readonly database: DatabaseService,
		@Inject(ConfigService) private readonly configService: ConfigService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				ExtractJwt.fromAuthHeaderAsBearerToken(),
				(req) => {
					let token = null;
					if (req && req.cookies) {
						token = req.cookies["kosh_access_token"];
					}
					return token;
				},
			]),
			ignoreExpiration: false,
			secretOrKey: configService.get<string>("JWT_SECRET") || "fallback-secret",
		});
	}

	async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
		const user_id = payload.sub;

		const user = await this.database.prisma.user.findFirst({
			where: {
				id: user_id,
			},
		});

		if (!user) {
			throw new UnauthorizedException("User not found");
		}

		return user;
	}
}
