import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthResponse } from './entities/authResponse.entity';
import { CreateUserInput } from './dto/createUser.input';
import { LoginInput } from './dto/login.input';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ) {
    return this.authService.createUser(createUserInput);
  }

  @Mutation(() => AuthResponse)
  async signin(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.signin(loginInput);
  }
}
