/* eslint-disable prettier/prettier */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { DatabaseService } from "src/database/database.service";
import { UserResponseDto } from './../modules/user/dto/UserResponseDto';

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {

    constructor(private readonly database: DatabaseService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: 'aff83852d12abd35fe7fca901d9a4982632e5f18736383b29d0c7ff4b6f085164b845ca1d2e98b352ee14599d01f992214e292a75cb3e99e892ccbd4fa153a29'
        });
    }
    async validate(payload:any): Promise<UserResponseDto> {

        const user_id = payload.sub;

        const user = await this.database.user.findFirst({
            where: {
                id: user_id
            }
            ,
            select: {
                id: true,
                username: true,
                email: true
            }
        }
        )

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            id:user.id,
            username:user.username,
            email:user.email
        }


    }

}