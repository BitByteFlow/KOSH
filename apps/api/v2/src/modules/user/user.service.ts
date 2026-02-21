import { Injectable, UnauthorizedException } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { UserResponse } from "./entities/userResponse.entity";

@Injectable()
export class UserService {
    constructor(private readonly database: DatabaseService) {

    }
    async getCurrentUser(id: string): Promise<UserResponse> {
        const user = await this.database.prisma.user.findUnique({
            where: {
                id: id
            },
            select: {
                id: true,
                email: true,
                username: true
            }
        }
        )
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            success: true,
            message: "User fetched successfully",
            data: user
        };
    }
}