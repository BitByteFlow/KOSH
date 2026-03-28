import { INestApplication } from "@nestjs/common";
import { execSync } from "child_process";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";
import { DatabaseService } from "../src/database/database.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import request from "supertest";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@kosh/db";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
export class TestDatabaseContext {
	private container?: StartedPostgreSqlContainer;
	public prisma: PrismaClient;
	public databaseUrl: string;
	private pool?: Pool;

	constructor() {
		this.prisma = null as any;
		this.databaseUrl = "";
	}
	async start(): Promise<void> {
		console.log("Starting PostgreSQL container...");
		
		this.container = await new PostgreSqlContainer()
			.withDatabase("test_kosh")
			.withUsername("test")
			.withPassword("test")
			.withStartupTimeout(120000)
			.start();

		this.databaseUrl = this.container.getConnectionUri();
		console.log("PostgreSQL container started:", this.databaseUrl);

		this.pool = new Pool({
			connectionString: this.databaseUrl,
			max: 5,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 10000,
		});

		const adapter = new PrismaPg(this.pool);

		this.prisma = new PrismaClient({
			adapter,
			log: ["error"],
		});

		await this.prisma.$connect();
		console.log("Prisma connected to test database");

		console.log("Pushing database schema...");
		execSync(
			`bun x prisma db push --schema=../../../packages/db/prisma/schema.prisma --accept-data-loss --url="${this.databaseUrl}"`,
			{
				env: { ...process.env, DATABASE_URL: this.databaseUrl },
				stdio: "inherit",
			},
		);
		console.log("Database schema pushed");
	}

	async clean(): Promise<void> {
		const models = [
			"notification",
			"dailyBalance",
			"accountTransaction",
			"creditAccount",
			"saleItem",
			"sale",
			"purchaseItem",
			"purchase",
			"variantAttribute",
			"productVariant",
			"product",
			"category",
			"settings",
			"storeJoinRequest",
			"storeMember",
			"store",
			"user",
		];

		for (const model of models) {
			try {
				await (this.prisma as any)[model].deleteMany();
			} catch (error) {
				// Ignore errors
			}
		}
	}

	async stop(): Promise<void> {
		console.log("Stopping test database...");
		
		if (this.prisma) {
			try {
				await this.prisma.$disconnect();
			} catch (e) {}
		}
		if (this.pool) {
			try {
				await this.pool.end();
			} catch (e) {}
		}
		if (this.container) {
			try {
				await this.container.stop();
			} catch (e) {}
		}
		
		console.log("Test database stopped");
	}
}

export class TestContext {
	app: INestApplication;
	databaseService: DatabaseService;
	jwtService: JwtService;
	testUserId: string;
	testUserToken: string;
	testStoreId: string;
	testDb: TestDatabaseContext;
	userId: string;
	token: string;
	storeId: string;

	private constructor(
		app: INestApplication,
		databaseService: DatabaseService,
		jwtService: JwtService,
		testDb: TestDatabaseContext,
	) {
		this.app = app;
		this.databaseService = databaseService;
		this.jwtService = jwtService;
		this.testDb = testDb;
		this.testUserId = "";
		this.testUserToken = "";
		this.testStoreId = "";
		this.userId = "";
		this.token = "";
		this.storeId = "";
	}

	static async create(): Promise<TestContext> {
		const testDb = new TestDatabaseContext();
		await testDb.start();

		const mockConfigService = {
			get: (key: string, defaultValue?: any) => {
				const config: Record<string, any> = {
					DATABASE_URL: testDb.databaseUrl,
					DB_MAX_CONNECTIONS: 3,
					JWT_SECRET: "test-jwt-secret-key-for-testing-only",
					JWT_EXPIRES_IN: "7d",
					NODE_ENV: "test",
				};
				return config[key] ?? defaultValue;
			},
		};

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(ConfigService)
			.useValue(mockConfigService)
			.overrideProvider("PUB_SUB")
			.useValue({ publish: () => {} })
			.compile();

		const app = moduleFixture.createNestApplication();
		app.setGlobalPrefix("/api/v2");
		await app.init();

		const databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
		const jwtService = moduleFixture.get<JwtService>(JwtService);

		const context = new TestContext(
			app,
			databaseService,
			jwtService,
			testDb,
		);

		await context.seedTestData();

		return context;
	}

	private async seedTestData(): Promise<void> {
		const id = `test_${Date.now()}`;
		const email = `${id}@test.com`;
		const googleId = `google_${id}`;
		const username = `testuser_${id}`;
		const user = await this.databaseService.user.create({
			data: {
				email,
				googleId,
				username,
				image: "https://test.com/image.jpg",
			},
		});

		const store = await this.databaseService.prisma.store.create({
			data: {
				name: `Test Store ${id}`,
				creatorId: user.id,
				members: {
					create: {
						userId: user.id,
						role: "ADMIN",
					},
				},
			},
		});

		const token = this.jwtService.sign({
			sub: user.id,
			email: user.email,
			username: user.username,
		});

		this.testUserId = user.id;
		this.testUserToken = token;
		this.testStoreId = store.id;
		this.userId = user.id;
		this.token = token;
		this.storeId = store.id;
	}

	async createAuthenticatedUser(overrides?: {
		email?: string;
		googleId?: string;
		username?: string;
	}): Promise<{ userId: string; token: string }> {
		const id = `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		const email = overrides?.email || `${id}@test.com`;
		const googleId = overrides?.googleId || `google_${id}`;
		const username = overrides?.username || `testuser_${id}`;

		const user = await this.databaseService.user.create({
			data: {
				email,
				googleId,
				username,
				image: "https://test.com/image.jpg",
			},
		});

		const token = this.jwtService.sign({
			sub: user.id,
			email: user.email,
			username: user.username,
		});

		return { userId: user.id, token };
	}

	async createCashierUser(): Promise<{ userId: string; token: string }> {
		const id = `cashier_${Date.now()}`;
		const email = `${id}@test.com`;
		const googleId = `google_${id}`;
		const username = `cashier_${id}`;

		const user = await this.databaseService.user.create({
			data: {
				email,
				googleId,
				username,
				image: "https://test.com/image.jpg",
			},
		});

		await this.databaseService.storeMember.create({
			data: {
				storeId: this.testStoreId,
				userId: user.id,
				role: "CASHIER",
			},
		});

		const token = this.jwtService.sign({
			sub: user.id,
			email: user.email,
			username: user.username,
		});

		return { userId: user.id, token };
	}

	graphqlRequest<T>(
		query: string,
		variables?: Record<string, any>,
		token?: string,
		storeId?: string,
	) {
		return request(this.app.getHttpServer())
			.post("/graphql")
			.set("Content-Type", "application/json")
			.set(token ? { Authorization: `Bearer ${token}` } : {})
			.set(storeId ? { "X-Store-Id": storeId } : {})
			.send({ query, variables });
	}

	restRequest() {
		return request(this.app.getHttpServer());
	}

	async clean(): Promise<void> {
		await this.testDb.clean();
		await this.seedTestData();
	}

	async close(): Promise<void> {
		try {
			await this.app.close();
		} catch (e) {}
		await this.testDb.stop();
	}
}

export async function createTestContext(): Promise<
	TestContext & { userId: string; token: string; storeId: string }
> {
	const context = await TestContext.create();
	return Object.assign(context, {
		userId: context.testUserId,
		token: context.testUserToken,
		storeId: context.testStoreId,
	});
}

export function generateTestId(prefix: string = "test"): string {
	return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
