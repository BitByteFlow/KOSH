import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserResponseDto } from './dto/UserResponseDto';

@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Query(() => UserResponseDto)
    async getCurrentUser(@Args('id') id: string): Promise<UserResponseDto> {
        return this.userService.getCurrentUser(id);
    }
}
