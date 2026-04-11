import { logger } from "./logger";

export async function retryApiCall<T>(
	fn: () => Promise<T>,
	maxRetries = 2,
	baseDelay = 1000,
): Promise<T> {
	let lastError: any;

	for (let i = 1; i <= maxRetries; i++) {
		try {
			return await fn();
		} catch (error: any) {
			lastError = error;

			if (
				error.response &&
				error.response.status >= 400 &&
				error.response.status < 500
			) {
				throw error;
			}

			const delay =
				Math.min(baseDelay * 2 ** i, 10000) + Math.random() * 1000;

			logger.warn(`Retry attempt ${i}/${maxRetries}`, "API", error);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}

	throw lastError;
}

export class CircuitBreaker {
	private failureCount: number = 0;
	private lastFailureTime: number = 0;
	private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";
	private readonly failureThreshold: number = 5;
	private readonly timeout: number = 60000;

	async call<T>(fn: () => Promise<T>): Promise<T> {
		const now = Date.now();

		if (this.state === "OPEN" && now - this.lastFailureTime > this.timeout) {
			this.state = "HALF_OPEN";
		}

		if (this.state === "OPEN") {
			throw new Error("Circuit breaker is OPEN");
		}

		try {
			const result = await fn();
			this.failureCount = 0;
			this.state = "CLOSED";
			return result;
		} catch (error) {
			this.failureCount++;
			this.lastFailureTime = now;

			if (this.failureCount >= this.failureThreshold) {
				this.state = "OPEN";
			}
			logger.error("Circuit breaker error", "API", error);

			throw error;
		}
	}
}
