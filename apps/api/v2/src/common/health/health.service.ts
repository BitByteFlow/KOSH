import { Injectable } from "@nestjs/common";
import {
	HealthCheckService,
	PrismaHealthIndicator,
	HealthCheckResult,
	HealthCheckError,
	type HealthIndicatorFunction,
} from "@nestjs/terminus";
import { DatabaseService } from "src/database/database.service";
import { ConfigService } from "@nestjs/config";

export interface HealthStatus {
	status: "ok" | "error";
	uptime: number;
	timestamp: string;
	version: string;
	environment: string;
	details: HealthCheckResult;
}

@Injectable()
export class HealthService {
	constructor(
		private readonly health: HealthCheckService,
		private readonly prismaHealth: PrismaHealthIndicator,
		private readonly databaseService: DatabaseService,
		private readonly configService: ConfigService,
	) {}

	async check(): Promise<HealthStatus> {
		const isProduction = this.configService.get("NODE_ENV") === "production";

		const healthChecks: HealthIndicatorFunction[] = [
			() =>
				this.prismaHealth.pingCheck("database", this.databaseService.prisma),
		];

		// Add memory check in production
		if (isProduction) {
			healthChecks.push(() => {
				const used = process.memoryUsage();
				const maxHeap = 4 * 1024 * 1024 * 1024; // 4GB max heap threshold
				const isHealthy = used.heapUsed < maxHeap;

				return Promise.resolve({
					memory: {
						status: isHealthy ? "up" : "down",
						heapUsed: Math.round(used.heapUsed / 1024 / 1024), // MB
						heapTotal: Math.round(used.heapTotal / 1024 / 1024), // MB
						rss: Math.round(used.rss / 1024 / 1024), // MB
					},
				});
			});
		}

		try {
			const result = await this.health.check(healthChecks);

			return {
				status: "ok",
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				version: this.configService.get("npm_package_version") || "1.0.0",
				environment: this.configService.get("NODE_ENV") || "development",
				details: result,
			};
		} catch (error) {
			const newLocal = error instanceof HealthCheckError;
			if (newLocal) {
				const details: HealthCheckResult = (
					error as HealthCheckError & { response?: HealthCheckResult }
				).response ?? {
					status: "error",
					details: {},
				};

				return {
					status: "error",
					uptime: process.uptime(),
					timestamp: new Date().toISOString(),
					version: this.configService.get("npm_package_version") || "1.0.0",
					environment: this.configService.get("NODE_ENV") || "development",
					details,
				};
			}

			throw error;
		}
	}

	async simpleCheck(): Promise<{ status: string; timestamp: string }> {
		return {
			status: "ok",
			timestamp: new Date().toISOString(),
		};
	}
}
