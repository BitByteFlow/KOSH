import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { DatabaseService } from "src/database/database.service";
import { UserResponseDto } from './../modules/user/dto/UserResponseDto';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {

    constructor(
        private readonly database: DatabaseService,
        private readonly configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET')!,
        });
    }
    async validate(payload:any): Promise<UserResponseDto> {

        const user_id = payload.sub;

        const user = await this.database.prisma.user.findFirst({
            where: {
                id: user_id
            }
        }
        )
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return user;


    }

}