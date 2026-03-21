import { Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/utils/jwt.guard';
import { CurrentUser } from 'src/utils/currentUser.decorator';
import type { AuthenticatedUser } from 'src/types/jwt.types';
import { UserService } from './user.service';
import { UserResponse } from './entities/userResponse.entity';

@Resolver()
@UseGuards(JwtAuthGuard)
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Query(() => UserResponse)
    async getCurrentUser(
        @CurrentUser() user: AuthenticatedUser
    ): Promise<UserResponse> {
        return await this.userService.getCurrentUser(user.id);
    }
}
