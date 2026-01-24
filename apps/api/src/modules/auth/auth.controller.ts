import { LoginRequestDto } from './dto/LoginRequestDto';
/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthResponseDto } from "./dto/AuthResponseDto";
import { CreateUserDto } from "./dto/CreateUserDto";

@Controller('users')
export class AuthController {
    constructor(private authService:AuthService){}


    @Post()
    async createUser(@Body() authPayLoad:CreateUserDto):Promise<AuthResponseDto>{

        const response = await this.authService.createUser(authPayLoad);

        return response;

    }

    @Get()
    async getUser(@Body() authPayLoad:LoginRequestDto):Promise<AuthResponseDto>{
        console.log(authPayLoad)
        const response = await this.authService.getUser(authPayLoad);
        return response;
    }

}