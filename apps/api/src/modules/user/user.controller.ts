/* eslint-disable prettier/prettier */
import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/utils/jwt.guard";
import { UserResponseDto } from "./dto/UserResponseDto";
import { UserService } from "./user.service";

@Controller("users/")
export class UserController{

    constructor(private userService:UserService){}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getCurrentUser(@Request() req):Promise<UserResponseDto>{
        const response =  await this.userService.getCurrentUser(req.user.id)
        return response;
    }
}