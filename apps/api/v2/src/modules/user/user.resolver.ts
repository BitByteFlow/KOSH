import { Args, Query, Resolver } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UserResponseInput} from './dto/UserResponseDto';

@Resolver()
export class UserResolver {
    constructor(private readonly userService: UserService) { }

    @Query(() => UserResponseInput)
    async getCurrentUser(@Args('id') id: string): Promise<UserResponseInput> {
        return this.userService.getCurrentUser(id);
    }
}
