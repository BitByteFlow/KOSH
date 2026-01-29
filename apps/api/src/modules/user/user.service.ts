/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { UserResponseDto } from "./dto/UserResponseDto";

@Injectable()
export class UserService {
    constructor(private readonly database: DatabaseService) {

    }

    async getCurrentUser(id: string): Promise<UserResponseDto> {

        const user = await this.database.user.findUnique({
            where: {
                id: id
            },
            select:{
                id:true,
                email:true,
                username:true
            }
        }
        )
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return  user;
    }
}