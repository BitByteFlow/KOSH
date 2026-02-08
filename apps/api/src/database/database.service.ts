import { Injectable, Logger, Global } from "@nestjs/common";
import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { PrismaClient } from "db";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Global()
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(DatabaseService.name);
	private pool?: Pool;
	public readonly prisma: PrismaClient;

	constructor(private configService: ConfigService) {
		const dbUrl = configService.get<string>("DATABASE_URL");
		const maxConnections = configService.get<number>("DB_MAX_CONNECTIONS") || 3;

		const pool = new Pool({
			connectionString: dbUrl,
			max: maxConnections,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		const adapter = new PrismaPg(pool);

		this.prisma = new PrismaClient({
			adapter,
			log:
				process.env.NODE_ENV === "development"
					? ["query", "error", "warn"]
					: ["error"],
			transactionOptions: {
				maxWait: 5000,
				timeout: 10000,
			},
		});

		this.pool = pool;
	}

	async onModuleInit() {
		try {
			await this.prisma.$executeRaw`SELECT 1`;
			this.logger.log("Successfully connected to the database.");
		} catch (error) {
			this.logger.error("Failed to connect to the database on init", error);
			process.exit(1);
		}
	}

	async onModuleDestroy() {
		try {
			await this.prisma.$disconnect();
			if (this.pool) {
				this.pool.end();
			}
			this.logger.log("Database connections closed.");
		} catch (error) {
			this.logger.error("Error during database shutdown", error);
		}
	}

	async cleanDatabase() {
		if (process.env.NODE_ENV === "production") {
			throw new Error("DANGER: Cannot clear database in production!");
		}

		const propertyNames = Object.getOwnPropertyNames(this);
		const modelNames = propertyNames.filter(
			(item) => !item.startsWith("_") && !item.startsWith("$"),
		);

		return Promise.all(
			modelNames.map((model) => (this as any)[model].deleteMany()),
		);
	}
}
