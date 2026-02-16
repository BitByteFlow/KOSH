import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../../database/database.service';
import { AuthResponse } from './entities/auth-response.entity';
import { CreateUserInput } from './dto/create-user.input';
import { LoginInput } from './dto/login.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async createUser(input: CreateUserInput): Promise<AuthResponse> {
    const { email, googleId, image, username } = input;

    const existingUser = await this.database.user.findFirst({
      where: {
        OR: [
          { email },
          {
            googleId: {
              not: null,
              equals: googleId,
            },
          },
        ],
      },
    });

    if (existingUser) {
      throw new UnauthorizedException(
        'User already exists with this email and user Id',
      );
    }

    const user = await this.database.user.create({
      data: {
        googleId,
        email,
        image,
        username,
      },
    });

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        image: user.image || undefined,
      },
    };
  }

  async signin(input: LoginInput): Promise<AuthResponse> {
    const { email, googleId } = input;

    const existingUser = await this.database.user.findFirst({
      where: {
        OR: [
          { email },
          {
            googleId: {
              not: null,
              equals: googleId,
            },
          },
        ],
      },
    });

    if (!existingUser) {
      throw new UnauthorizedException(
        "User doesn't exist with this email and googleId",
      );
    }

    const token = this.jwtService.sign({
      sub: existingUser.id,
      email: existingUser.email,
      username: existingUser.username,
    });

    return {
      token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        username: existingUser.username,
        image: existingUser.image || undefined,
      },
    };
  }
}
