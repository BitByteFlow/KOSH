import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserResponse } from './entities/userResponse.entity';

@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Query(() => UserResponse)
    async getCurrentUser(@Args('id') id: string): Promise<UserResponse> {
        return await this.userService.getCurrentUser(id);
    }
}
