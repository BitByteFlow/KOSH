import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DatabaseService } from '../../database/database.service';

describe('AuthService (Integration)', () => {
	let authService: AuthService;
	let databaseService: DatabaseService;
	let jwtService: JwtService;

	const testEmail = 'integration-test@example.com';
	const testGoogleId = 'google-unique-123';

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				JwtModule.register({
					secret: 'test-secret-key',
					signOptions: { expiresIn: '1h' },
				}),
			],
			providers: [AuthService, DatabaseService],
		}).compile();

		authService = module.get<AuthService>(AuthService);
		databaseService = module.get<DatabaseService>(DatabaseService);
		jwtService = module.get<JwtService>(JwtService);

		await databaseService.prisma.$connect();
	});

	afterAll(async () => {
		await databaseService.user.deleteMany({
			where: { email: { contains: 'test@example.com' } },
		});
		await databaseService.prisma.$disconnect();
	});

	beforeEach(async () => {
		await databaseService.user.deleteMany();
	});

	describe('createUser', () => {
		it('should persist a new user in the DB and return a valid JWT', async () => {
			const result = await authService.createUser(
				testEmail,
				testGoogleId,
				'https://image.com/photo.jpg',
				'testuser',
			);

			expect(result.user.email).toBe(testEmail);
			expect(result.token).toBeDefined();

			const decoded = jwtService.decode(result.token) as any;
			expect(decoded.sub).toBe(result.user.id);

			const userInDb = await databaseService.user.findUnique({
				where: { email: testEmail },
			});
			expect(userInDb).not.toBeNull();
			expect(userInDb?.googleId).toBe(testGoogleId);
		});

		it('should throw UnauthorizedException if email is already taken', async () => {
			await databaseService.user.create({
				data: {
					email: testEmail,
					googleId: 'different-google-id',
					username: 'existinguser',
				},
			});

			await expect(
				authService.createUser(testEmail, testGoogleId, 'img.jpg', 'newuser'),
			).rejects.toThrow(UnauthorizedException);
		});
	});

	describe('signin', () => {
		it('should allow login for an existing user and return fresh token', async () => {
			const existingUser = await databaseService.user.create({
				data: {
					email: testEmail,
					googleId: testGoogleId,
					username: 'login-user',
				},
			});

			const result = await authService.signin(testEmail, testGoogleId);
			expect(result.user.id).toBe(existingUser.id);
			expect(result.token).toBeDefined();
		});

		it('should throw UnauthorizedException for non-existent credentials', async () => {
			await expect(
				authService.signin('ghost@example.com', 'no-id'),
			).rejects.toThrow(UnauthorizedException);
		});
	});
});