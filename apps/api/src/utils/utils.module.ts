import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { JwtAuthGuard } from "./jwt.guard";
import { JWTStrategy } from "./jwt.strategy";

@Module({
    imports: [PassportModule.register({defaultStrategy:'jwt'})],
    providers: [JwtAuthGuard, JWTStrategy],
    exports:[JwtAuthGuard,JWTStrategy]
})
export class UtilsModule { }