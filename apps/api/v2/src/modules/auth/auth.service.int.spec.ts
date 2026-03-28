import {
	TestContext,
	createTestContext,
	generateTestId,
} from "test/test-utils";
import { PrismaClient } from "@kosh/db";
import { AuthService } from "./auth.service";
import { DatabaseService } from "../../database/database.service";
import { JwtService } from "@nestjs/jwt";

describe("AuthService Integration Tests", () => {
	let context: TestContext;
	let authService: AuthService;
	let databaseService: DatabaseService;
	let jwtService: JwtService;
	let prisma: PrismaClient;

	beforeAll(async () => {
		context = await createTestContext();
		databaseService = context.databaseService;
		prisma = databaseService.prisma;
		jwtService = context.jwtService;
		authService = new AuthService(databaseService, jwtService);
	});

	afterAll(async () => {
		await context.close();
	});

	beforeEach(async () => {
		await prisma.saleItem.deleteMany();
		await prisma.sale.deleteMany();
		await prisma.purchaseItem.deleteMany();
		await prisma.purchase.deleteMany();
		await prisma.accountTransaction.deleteMany();
		await prisma.dailyBalance.deleteMany();
		await prisma.creditAccount.deleteMany();
		await prisma.storeMember.deleteMany();
		await prisma.storeJoinRequest.deleteMany();
		await prisma.store.deleteMany();
		await prisma.user.deleteMany();
	});

	describe("createUser - Success Scenarios", () => {
		it("should create a new user with store successfully", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			const result = await authService.createUser(
				email,
				googleId,
				image,
				username,
				false,
			);

			expect(result.user).toBeDefined();
			expect(result.user.email).toBe(email);
			expect(result.user.username).toBe(username);
			expect(result.token).toBeDefined();
			expect(result.store).toBeDefined();
			expect(result.store?.storeId).toBeDefined();
			expect(result.store?.storeName).toContain("store-");

			// Verify user was created
			const user = await prisma.user.findUnique({
				where: { id: result.user.id },
			});
			expect(user).toBeDefined();
			expect(user?.email).toBe(email);
			expect(user?.googleId).toBe(googleId);

			// Verify store was created
			const store = await prisma.store.findUnique({
				where: { id: result.store?.storeId },
			});
			expect(store).toBeDefined();
			expect(store?.creatorId).toBe(user?.id);

			// Verify user is admin of store
			const member = await prisma.storeMember.findUnique({
				where: { userId: user?.id },
			});
			expect(member).toBeDefined();
			expect(member?.role).toBe("ADMIN");
		});

		it("should create user as cashier without creating store", async () => {
			const email = `${generateTestId("cashier")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("cashier");
			const image = "https://test.com/image.jpg";

			const result = await authService.createUser(
				email,
				googleId,
				image,
				username,
				true,
			);

			expect(result.user).toBeDefined();
			expect(result.user.email).toBe(email);
			expect(result.token).toBeDefined();
			expect(result.store).toBeUndefined();

			// Verify user was created
			const user = await prisma.user.findUnique({
				where: { id: result.user.id },
			});
			expect(user).toBeDefined();

			// Verify no store was created for cashier
			const stores = await prisma.store.findMany({
				where: { creatorId: user?.id },
			});
			expect(stores).toHaveLength(0);
		});

		it("should generate valid JWT token", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			const result = await authService.createUser(
				email,
				googleId,
				image,
				username,
				false,
			);

			// Verify token is valid
			const decoded = jwtService.verify(result.token);
			expect(decoded.sub).toBe(result.user.id);
			expect(decoded.email).toBe(email);
			expect(decoded.username).toBe(username);
		});
	});

	describe("createUser - Error Scenarios", () => {
		it("should throw UnauthorizedException if user with email already exists", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			// Create first user
			await authService.createUser(email, googleId, image, username, false);

			// Try to create user with same email
			await expect(
				authService.createUser(
					email,
					generateTestId("google2"),
					image,
					generateTestId("username2"),
					false,
				),
			).rejects.toThrow("User already exists");
		});

		it("should throw UnauthorizedException if user with googleId already exists", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			// Create first user
			await authService.createUser(email, googleId, image, username, false);

			// Try to create user with same googleId
			await expect(
				authService.createUser(
					`${generateTestId("user2")}@test.com`,
					googleId,
					image,
					generateTestId("username2"),
					false,
				),
			).rejects.toThrow("User already exists");
		});
	});

	describe("signin - Success Scenarios", () => {
		it("should signin existing user and return token with store", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			// Create user first
			await authService.createUser(email, googleId, image, username, false);

			// Sign in
			const result = await authService.signin(email, googleId, false);

			expect(result.user).toBeDefined();
			expect(result.user.email).toBe(email);
			expect(result.user.username).toBe(username);
			expect(result.token).toBeDefined();
			expect(result.store).toBeDefined();
			expect(result.store?.storeId).toBeDefined();
			expect(result.isStoreCashier).toBe(false);

			// Verify token is valid
			const decoded = jwtService.verify(result.token);
			expect(decoded.sub).toBe(result.user.id);
		});

		it("should signin cashier and return store membership", async () => {
			// Create admin user and store
			const adminEmail = `${generateTestId("admin")}@test.com`;
			const adminGoogleId = generateTestId("admin-google");
			const adminUsername = generateTestId("admin");

			const adminResult = await authService.createUser(
				adminEmail,
				adminGoogleId,
				"https://test.com/image.jpg",
				adminUsername,
				false,
			);

			const storeId = adminResult.store?.storeId;

			// Create cashier user
			const cashierEmail = `${generateTestId("cashier")}@test.com`;
			const cashierGoogleId = generateTestId("cashier-google");
			const cashierUsername = generateTestId("cashier");

			const cashierResult = await authService.createUser(
				cashierEmail,
				cashierGoogleId,
				"https://test.com/image.jpg",
				cashierUsername,
				true,
			);

			// Add cashier to store
			await prisma.storeMember.create({
				data: {
					storeId: storeId!,
					userId: cashierResult.user.id,
					role: "CASHIER",
				},
			});

			// Sign in cashier
			const result = await authService.signin(
				cashierEmail,
				cashierGoogleId,
				true,
			);

			expect(result.user).toBeDefined();
			expect(result.isStoreCashier).toBe(true);
			expect(result.store?.storeId).toBe(storeId);
		});

		it("should return existing user's store membership on signin", async () => {
			// Create admin user and store
			const adminEmail = `${generateTestId("admin")}@test.com`;
			const adminGoogleId = generateTestId("admin-google");
			const adminUsername = generateTestId("admin");

			const adminResult = await authService.createUser(
				adminEmail,
				adminGoogleId,
				"https://test.com/image.jpg",
				adminUsername,
				false,
			);

			const storeId = adminResult.store?.storeId;

			// Create user and add to store
			const userEmail = `${generateTestId("member")}@test.com`;
			const userGoogleId = generateTestId("user-google");
			const username = generateTestId("member");

			await authService.createUser(
				userEmail,
				userGoogleId,
				"https://test.com/image.jpg",
				username,
				true,
			);

			const user = await prisma.user.findUnique({
				where: { email: userEmail },
			});

			await prisma.storeMember.create({
				data: {
					storeId: storeId!,
					userId: user!.id,
					role: "CASHIER",
				},
			});

			// Sign in user
			const result = await authService.signin(userEmail, userGoogleId, true);

			expect(result.store?.storeId).toBe(storeId);
		});
	});

	describe("signin - Error Scenarios", () => {
		it("should throw UnauthorizedException if user doesn't exist", async () => {
			const email = "nonexistent@test.com";
			const googleId = "nonexistent-google";

			await expect(
				authService.signin(email, googleId, false),
			).rejects.toThrow("User doesn't exist");
		});

		it("should throw UnauthorizedException if email doesn't match", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			// Create user
			await authService.createUser(email, googleId, image, username, false);

			// Try to signin with different email
			await expect(
				authService.signin("wrong@test.com", googleId, false),
			).rejects.toThrow("User doesn't exist");
		});

		it("should throw UnauthorizedException if googleId doesn't match", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			// Create user
			await authService.createUser(email, googleId, image, username, false);

			// Try to signin with different googleId
			await expect(
				authService.signin(email, "wrong-google", false),
			).rejects.toThrow("User doesn't exist");
		});
	});

	describe("Data Integrity Tests", () => {
		it("should create user with correct relationships", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			const result = await authService.createUser(
				email,
				googleId,
				image,
				username,
				false,
			);

			const user = await prisma.user.findUnique({
				where: { id: result.user.id },
				include: {
					createdStores: true,
					storeMember: true,
				},
			});

			expect(user?.createdStores).toHaveLength(1);
			expect(user?.storeMember).toBeDefined();
			expect(user?.storeMember?.role).toBe("ADMIN");
		});

		it("should handle multiple users with unique emails", async () => {
			const users = [];
			for (let i = 0; i < 5; i++) {
				const email = `${generateTestId(`user${i}`)}@test.com`;
				const googleId = generateTestId(`google${i}`);
				const username = generateTestId(`username${i}`);

				const result = await authService.createUser(
					email,
					googleId,
					"https://test.com/image.jpg",
					username,
					false,
				);
				users.push(result);
			}

			expect(users).toHaveLength(5);
			const emails = users.map((u) => u.user.email);
			const uniqueEmails = new Set(emails);
			expect(uniqueEmails.size).toBe(5);
		});

		it("should handle concurrent user creation", async () => {
			const userPromises = Array.from({ length: 5 }).map((_, i) =>
				authService.createUser(
					`${generateTestId(`user${i}`)}@test.com`,
					generateTestId(`google${i}`),
					"https://test.com/image.jpg",
					generateTestId(`username${i}`),
					false,
				),
			);

			const results = await Promise.all(userPromises);

			results.forEach((result) => {
				expect(result.user).toBeDefined();
				expect(result.token).toBeDefined();
			});

			// Verify all users were created
			const allUsers = await prisma.user.findMany({
				where: {
					email: {
						in: results.map((r) => r.user.email),
					},
				},
			});

			expect(allUsers).toHaveLength(5);
		});
	});

	describe("Edge Cases", () => {
		it("should handle user with special characters in username", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username-special!@#$%");
			const image = "https://test.com/image.jpg";

			const result = await authService.createUser(
				email,
				googleId,
				image,
				username,
				false,
			);

			expect(result.user.username).toBe(username);
		});

		it("should handle user with very long email", async () => {
			const email = `${generateTestId("user".repeat(10))}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			const result = await authService.createUser(
				email,
				googleId,
				image,
				username,
				false,
			);

			expect(result.user.email).toBe(email);
		});

		it("should handle multiple signins for same user", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("username");
			const image = "https://test.com/image.jpg";

			// Create user
			await authService.createUser(email, googleId, image, username, false);

			// Sign in multiple times
			const tokens = [];
			for (let i = 0; i < 3; i++) {
				const result = await authService.signin(email, googleId, false);
				tokens.push(result.token);
			}

			// All tokens should be valid
			tokens.forEach((token) => {
				const decoded = jwtService.verify(token);
				expect(decoded.email).toBe(email);
			});
		});

		it("should handle store name generation", async () => {
			const email = `${generateTestId("user")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("mystore");
			const image = "https://test.com/image.jpg";

			const result = await authService.createUser(
				email,
				googleId,
				image,
				username,
				false,
			);

			expect(result.store?.storeName).toContain("store-");
		});

		it("should handle cashier signin without store membership", async () => {
			const email = `${generateTestId("cashier")}@test.com`;
			const googleId = generateTestId("google");
			const username = generateTestId("cashier");
			const image = "https://test.com/image.jpg";

			// Create cashier
			await authService.createUser(email, googleId, image, username, true);

			// Sign in cashier (without store membership)
			const result = await authService.signin(email, googleId, true);

			expect(result.isStoreCashier).toBe(false);
			expect(result.store?.storeId).toBe("");
		});
	});
});
