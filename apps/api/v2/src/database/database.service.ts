import { Injectable, Logger, Global, Inject } from "@nestjs/common";
import { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@kosh/db";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

@Global()
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(DatabaseService.name);
	private pool?: Pool;
	public readonly prisma: PrismaClient;

	constructor(
		@Inject(ConfigService) private readonly configService: ConfigService,
	) {
		const dbUrl = this.configService.get<string>("DATABASE_URL");
		const maxConnections =
			this.configService.get<number>("DB_MAX_CONNECTIONS") || 3;

		if (!dbUrl) {
			throw new Error("DATABASE_URL environment variable is not set");
		}

		const pool = new Pool({
			connectionString: dbUrl,
			max: maxConnections,
			idleTimeoutMillis: 30000,
			connectionTimeoutMillis: 2000,
		});

		const adapter = new PrismaPg(pool);

		this.prisma = new PrismaClient({
			adapter,
			// log:
			// 	process.env.NODE_ENV === "development"
			// 		? ["query", "error", "warn"]
			// 		: ["error"],
			transactionOptions: {
				maxWait: 5000,
				timeout: 10000,
			},
		});

		this.pool = pool;
	}

	get user(): PrismaClient["user"] {
		return this.prisma.user;
	}
	get product(): PrismaClient["product"] {
		return this.prisma.product;
	}
	get category(): PrismaClient["category"] {
		return this.prisma.category;
	}
	get productVariant(): PrismaClient["productVariant"] {
		return this.prisma.productVariant;
	}
	get purchase(): PrismaClient["purchase"] {
		return this.prisma.purchase;
	}
	get sale(): PrismaClient["sale"] {
		return this.prisma.sale;
	}
	get accountTransaction(): PrismaClient["accountTransaction"] {
		return this.prisma.accountTransaction;
	}
	get dailyBalance(): PrismaClient["dailyBalance"] {
		return this.prisma.dailyBalance;
	}
	get creditAccount(): PrismaClient["creditAccount"] {
		return this.prisma.creditAccount;
	}
	get settings(): PrismaClient["settings"] {
		return this.prisma.settings;
	}
	get storeMember(): PrismaClient["storeMember"] {
		return this.prisma.storeMember;
	}
	get store(): PrismaClient["store"] {
		return this.prisma.store;
	}
	get saleItem(): PrismaClient["saleItem"] {
		return this.prisma.saleItem;
	}
	get purchaseItem(): PrismaClient["purchaseItem"] {
		return this.prisma.purchaseItem;
	}
	get variantAttribute(): PrismaClient["variantAttribute"] {
		return this.prisma.variantAttribute;
	}
	get storeJoinRequest(): PrismaClient["storeJoinRequest"] {
		return this.prisma.storeJoinRequest;
	}
	get notification(): PrismaClient["notification"] {
		return this.prisma.notification;
	}

	get $executeRaw() {
		return this.prisma.$executeRaw.bind(this.prisma);
	}
	get $queryRaw() {
		return this.prisma.$queryRaw.bind(this.prisma);
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
		// Or using Reflect to find models on this.prisma
		const models = [
			"user",
			"product",
			"category",
			"productVariant",
			"purchase",
		];
		return Promise.all(
			models.map((model) => (this.prisma as any)[model].deleteMany()),
		);
	}
}
