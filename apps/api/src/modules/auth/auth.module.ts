/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    imports: [JwtModule.register({
        secret: 'aff83852d12abd35fe7fca901d9a4982632e5f18736383b29d0c7ff4b6f085164b845ca1d2e98b352ee14599d01f992214e292a75cb3e99e892ccbd4fa153a29',
        signOptions: {
            expiresIn: '15h',
            algorithm: 'HS256',
        },
    })],
    providers: [AuthService],
    controllers: [AuthController],
})
export class AuthModule { }

