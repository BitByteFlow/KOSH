import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../src/modules/auth/auth.service';
import { DatabaseService } from '../src/database/database.service';
import { AuthResponseDto } from '../src/modules/auth/dto/AuthResponseDto';

describe('AuthService', () => {
  let authService: AuthService;
  let databaseService: DatabaseService;
  let jwtService: JwtService;

  const mockDatabaseService = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    databaseService = module.get<DatabaseService>(DatabaseService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto = {
      email: 'test@example.com',
      googleId: 'google123',
      username: 'testuser',
      image: 'https://example.com/image.jpg',
    };

    const mockUser = {
      id: 'user-123',
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockToken = 'jwt-token-123';

    it('should create a new user successfully', async () => {
      mockDatabaseService.user.findFirst.mockResolvedValue(null);
      mockDatabaseService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result: AuthResponseDto = await authService.createUser(
        createUserDto.email,
        createUserDto.googleId,
        createUserDto.image,
        createUserDto.username,
      );

      expect(databaseService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: createUserDto.email },
            { googleId: { not: null, equals: createUserDto.googleId } },
          ],
        },
      });
      expect(databaseService.user.create).toHaveBeenCalledWith({
        data: {
          googleId: createUserDto.googleId,
          email: createUserDto.email,
          image: createUserDto.image,
          username: createUserDto.username,
        },
      });
      expect(result).toEqual({
        token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
      });
    });

    it('should throw UnauthorizedException if user with email already exists', async () => {
      mockDatabaseService.user.findFirst.mockResolvedValue(mockUser);

      await expect(
        authService.createUser(
          createUserDto.email,
          createUserDto.googleId,
          createUserDto.image,
          createUserDto.username,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(databaseService.user.create).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if user with googleId already exists', async () => {
      mockDatabaseService.user.findFirst.mockResolvedValue({
        ...mockUser,
        googleId: createUserDto.googleId,
      });

      await expect(
        authService.createUser(
          'different@example.com',
          createUserDto.googleId,
          createUserDto.image,
          createUserDto.username,
        ),
      ).rejects.toThrow(UnauthorizedException);
      expect(databaseService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('signin', () => {
    const email = 'test@example.com';
    const googleId = 'google123';

    const mockUser = {
      id: 'user-123',
      email,
      googleId,
      username: 'testuser',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockToken = 'jwt-token-123';

    it('should sign in user successfully', async () => {
      mockDatabaseService.user.findFirst.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue(mockToken);

      const result: AuthResponseDto = await authService.signin(email, googleId);

      expect(databaseService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email }, { googleId: { not: null, equals: googleId } }],
        },
      });
      expect(result).toEqual({
        token: mockToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          username: mockUser.username,
        },
      });
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      mockDatabaseService.user.findFirst.mockResolvedValue(null);

      await expect(authService.signin(email, googleId)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
