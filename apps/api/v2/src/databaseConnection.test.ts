import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { PrismaClient } from "@kosh/db";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

describe("Database Connection Test", () => {
	let container: any;
	let prisma: PrismaClient;
	let pool: Pool;

	beforeAll(async () => {
		console.log("Starting PostgreSQL container...");

		container = await new PostgreSqlContainer()
			.withDatabase("test_kosh")
			.withUsername("test")
			.withPassword("test")
			.withStartupTimeout(120000)
			.start();

		const databaseUrl = container.getConnectionUri();
		console.log("PostgreSQL started:", databaseUrl);

		pool = new Pool({
			connectionString: databaseUrl,
			max: 5,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 10000,
		});

		const adapter = new PrismaPg(pool);

		prisma = new PrismaClient({
			adapter,
			log: ["error"],
		});

		await prisma.$connect();
		console.log("Prisma connected!");
	}, 180000);

	afterAll(async () => {
		console.log("Cleaning up...");
		if (prisma) {
			await prisma.$disconnect();
		}
		if (pool) {
			await pool.end();
		}
		if (container) {
			await container.stop();
		}
		console.log("Cleanup complete");
	}, 60000);

	it("should connect to test database and create user", async () => {
		console.log("Running test: create user");

		const result = await prisma.$queryRaw`SELECT 1 as test`;
		console.log("Query result:", result);
		expect(result).toEqual([{ test: 1 }]);

		const user = await prisma.user.create({
			data: {
				email: "test@example.com",
				googleId: "test-google-id",
				username: "testuser",
				image: "https://test.com/image.jpg",
			},
		});

		console.log("Created user:", user.id);
		expect(user).toBeDefined();
		expect(user.email).toBe("test@example.com");

		await prisma.user.delete({ where: { id: user.id } });
		console.log("Test complete");
	});

	it("should create and query store", async () => {
		const user = await prisma.user.create({
			data: {
				email: "storetest@example.com",
				googleId: "store-test-google-id",
				username: "storetestuser",
				image: "https://test.com/image.jpg",
			},
		});

		const store = await prisma.store.create({
			data: {
				name: "Test Store",
				creatorId: user.id,
			},
		});

		expect(store).toBeDefined();
		expect(store.name).toBe("Test Store");
		expect(store.creatorId).toBe(user.id);

		await prisma.store.delete({ where: { id: store.id } });
		await prisma.user.delete({ where: { id: user.id } });
	});
});
