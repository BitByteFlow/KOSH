import { Injectable, Logger } from "@nestjs/common";
import {
	PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError,
	PrismaClientRustPanicError,
	PrismaClientInitializationError,
	PrismaClientValidationError,
} from "@kosh/db";
import { SentryService } from "../sentry/sentry.service";
import { DatabaseError, ErrorCode } from "../sentry/errors";
import type { PrismaErrorContext } from "../sentry/types";

/**
 * PrismaErrorHandler - Database error classification and reporting
 *
 * Uses SentryService for error reporting (no direct Sentry SDK calls)
 * Provides user-friendly error messages while preserving technical details
 */
@Injectable()
export class PrismaErrorHandler {
	private readonly logger = new Logger(PrismaErrorHandler.name);

	constructor(private readonly sentryService: SentryService) {}

	/**
	 * Handle Prisma errors by classifying and reporting them
	 *
	 * This method always throws a DatabaseError - it never returns normally
	 */
	handlePrismaError(error: unknown, context?: PrismaErrorContext): never {
		const errorInfo = this._classifyPrismaError(error, context);

		// Report to Sentry via service wrapper
		this.sentryService.withScope((scope) => {
			scope.setTag("error.type", "DATABASE_ERROR");
			scope.setTag("error.source", "prisma");
			scope.setTag("prisma.error_code", errorInfo.code);
			scope.setTag(
				"error.is_retryable",
				errorInfo.isRetryable ? "true" : "false",
			);

			if (context?.userId) {
				scope.setUser({ id: context.userId });
			}

			scope.setContext("prisma", {
				operation: context?.operation || "unknown",
				model: context?.model || "unknown",
				error_category: errorInfo.category,
				error_message: errorInfo.message,
			});

			if (context?.args) {
				scope.setExtras({ prisma_args: context.args });
			}

			scope.setLevel(errorInfo.isExpected ? "warning" : "error");
			this.sentryService.captureException(error);
		});

		// Log for debugging (expected errors at debug level)
		if (errorInfo.isExpected) {
			this.logger.debug(
				`Prisma error [${errorInfo.code}]: ${errorInfo.message}`,
			);
		} else {
			this.logger.error(
				`Prisma error [${errorInfo.code}]: ${errorInfo.message}`,
				error,
			);
		}

		throw new DatabaseError(errorInfo.userMessage, {
			code: errorInfo.code as ErrorCode,
			cause: error,
		});
	}

	/**
	 * Wrap a Prisma operation with automatic error handling
	 *
	 * @example
	 * ```typescript
	 * const user = await this.prismaErrorHandler.wrapPrismaOperation(
	 *   () => this.prisma.user.findUnique({ where: { id } }),
	 *   { operation: 'findUser', model: 'User', userId: id }
	 * );
	 * ```
	 */
	async wrapPrismaOperation<T>(
		operation: () => Promise<T>,
		context?: PrismaErrorContext,
	): Promise<T> {
		try {
			return await operation();
		} catch (error) {
			this.handlePrismaError(error, context);
		}
	}

	/**
	 * Classify a Prisma error into a standardized format
	 */
	private _classifyPrismaError(
		error: unknown,
		context?: PrismaErrorContext,
	): {
		code: string;
		message: string;
		userMessage: string;
		category: string;
		isExpected: boolean;
		isRetryable: boolean;
	} {
		const model = context?.model || "Unknown";
		const operation = context?.operation || "unknown";

		// Handle known Prisma error types
		if (error instanceof PrismaClientKnownRequestError) {
			return this._handleKnownPrismaError(error, model, operation);
		}

		if (error instanceof PrismaClientUnknownRequestError) {
			return {
				code: "PRISMA_UNKNOWN",
				message: error.message,
				userMessage: "A database error occurred. Please try again.",
				category: "unknown_request",
				isExpected: false,
				isRetryable: true,
			};
		}

		if (error instanceof PrismaClientRustPanicError) {
			return {
				code: "PRISMA_PANIC",
				message: error.message,
				userMessage:
					"A critical database error occurred. Please contact support.",
				category: "rust_panic",
				isExpected: false,
				isRetryable: false,
			};
		}

		if (error instanceof PrismaClientInitializationError) {
			return {
				code: "PRISMA_INIT",
				message: error.message,
				userMessage: "Database connection failed. Please contact support.",
				category: "initialization",
				isExpected: false,
				isRetryable: false,
			};
		}

		if (error instanceof PrismaClientValidationError) {
			return {
				code: "PRISMA_VALIDATION",
				message: error.message,
				userMessage: "Invalid database operation. Please contact support.",
				category: "validation",
				isExpected: false,
				isRetryable: false,
			};
		}

		// Generic error handling
		if (error instanceof Error) {
			return {
				code: "DATABASE_ERROR",
				message: error.message,
				userMessage: "A database error occurred. Please try again.",
				category: "generic",
				isExpected: false,
				isRetryable: true,
			};
		}

		// Unknown error type
		return {
			code: "UNKNOWN_DATABASE_ERROR",
			message: String(error),
			userMessage: "An unexpected error occurred. Please try again.",
			category: "unknown",
			isExpected: false,
			isRetryable: false,
		};
	}

	/**
	 * Handle known Prisma error codes with specific messages
	 */
	private _handleKnownPrismaError(
		error: PrismaClientKnownRequestError,
		model: string,
		operation: string,
	): {
		code: string;
		message: string;
		userMessage: string;
		category: string;
		isExpected: boolean;
		isRetryable: boolean;
	} {
		const code = error.code;

		switch (code) {
			// P2025: Record not found
			case "P2025":
				return {
					code,
					message: error.message,
					userMessage: `The requested ${model.toLowerCase()} was not found.`,
					category: "not_found",
					isExpected: true,
					isRetryable: false,
				};

			// P2002: Unique constraint failed
			case "P2002": {
				const target =
					(error.meta?.target as string[])?.join(", ") || "unique field";
				return {
					code,
					message: error.message,
					userMessage: `A record with this ${target} already exists.`,
					category: "constraint_violation",
					isExpected: true,
					isRetryable: false,
				};
			}

			// P2003: Foreign key constraint failed
			case "P2003":
				return {
					code,
					message: error.message,
					userMessage: "This operation would violate a database relationship.",
					category: "constraint_violation",
					isExpected: true,
					isRetryable: false,
				};

			// P2000: Value too long
			case "P2000":
				return {
					code,
					message: error.message,
					userMessage: "One of the provided values is too long.",
					category: "validation",
					isExpected: true,
					isRetryable: false,
				};

			// P2006: Invalid value
			case "P2006":
				return {
					code,
					message: error.message,
					userMessage: "An invalid value was provided.",
					category: "validation",
					isExpected: true,
					isRetryable: false,
				};

			// P2020/P2021: Timeout
			case "P2020":
			case "P2021":
				return {
					code,
					message: error.message,
					userMessage:
						"The database operation timed out. Please try again.",
					category: "timeout",
					isExpected: false,
					isRetryable: true,
				};

			// P2005: Database busy
			case "P2005":
				return {
					code,
					message: error.message,
					userMessage: "Database is currently busy. Please try again.",
					category: "connection",
					isExpected: false,
					isRetryable: true,
				};

			// P2010: Schema configuration error
			case "P2010":
				return {
					code,
					message: error.message,
					userMessage:
						"Database configuration error. Please contact support.",
					category: "schema",
					isExpected: false,
					isRetryable: false,
				};

			// P2018: Required relation not found
			case "P2018":
				return {
					code,
					message: error.message,
					userMessage: "A required related record was not found.",
					category: "not_found",
					isExpected: true,
					isRetryable: false,
				};

			// Default: Unknown error code
			default:
				return {
					code,
					message: error.message,
					userMessage: "A database error occurred. Please try again.",
					category: "unknown",
					isExpected: false,
					isRetryable: false,
				};
		}
	}
}
