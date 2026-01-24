/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { UtilsModule } from "src/utils/utils.module";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";

@Module({
    imports: [UtilsModule],
    controllers: [UserController],
    providers: [UserService]
})
export class UserModule { }