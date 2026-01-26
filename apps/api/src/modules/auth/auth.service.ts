import { LoginRequestDto } from './dto/LoginRequestDto';
/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { AuthResponseDto } from './dto/AuthResponseDto';
import { CreateUserDto } from './dto/CreateUserDto';

@Injectable()
export class AuthService {
    constructor(
        private readonly database: DatabaseService,
        private readonly jwtService: JwtService
    ) { }


    async createUser(authPayLoad: CreateUserDto): Promise<AuthResponseDto> {


        const existinguser = await this.database.user.findFirst({
            where: {
                OR: [
                    { email: authPayLoad.email },
                    {
                        googleId: {
                            not: null,
                            equals: authPayLoad.googleId
                        }
                    },
                ]
            }
        })

        if (existinguser) {
            throw new UnauthorizedException("User already exists with this email and user Id")

        }

        const user = await this.database.user.create({
            data: {
                googleId: authPayLoad.googleId,
                email: authPayLoad.email,
                image: authPayLoad.image,
                username: authPayLoad.username,
            }
        })

        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            username: user.username
        });

        return {
            token: token
        }

    }

    async getUser(authPayLoad: LoginRequestDto): Promise<AuthResponseDto> {

        console.log(authPayLoad)

        const existinguser = await this.database.user.findFirst({
            where: {
                OR: [
                    { email: authPayLoad.email },
                    {
                        googleId: {
                            not: null,
                            equals: authPayLoad.googleId
                        }
                    },
                ]
            }
            
        })


        if (!existinguser) {

            throw new UnauthorizedException("User doesn't exist with this email and googleId")

        }


        const token = this.jwtService.sign({
            sub: existinguser.id,
            email: existinguser.email,
            username: existinguser.username
        });

        return {
            token: token
        }
    }

}
