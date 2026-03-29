import { Injectable, Logger } from "@nestjs/common";
import {
	PrismaClientKnownRequestError,
	PrismaClientUnknownRequestError,
	PrismaClientRustPanicError,
	PrismaClientInitializationError,
	PrismaClientValidationError,
} from "@kosh/db";
import * as Sentry from "@sentry/nestjs";
import { ErrorType } from "./sentry.service";

export interface PrismaErrorContext {
	operation?: string;
	model?: string;
	args?: Record<string, unknown>;
	userId?: string;
	query?: string;
}

export class DatabaseError extends Error {
	type = "DATABASE_ERROR";
	code: string;
	isRetryable: boolean;

	constructor(message: string, code: string, isRetryable = false) {
		super(message);
		this.code = code;
		this.isRetryable = isRetryable;
		this.name = "DatabaseError";
	}
}

@Injectable()
export class PrismaErrorHandler {
	private readonly logger = new Logger(PrismaErrorHandler.name);
	handlePrismaError(error: unknown, context?: PrismaErrorContext): never {
		const errorInfo = this.classifyPrismaError(error, context);

		Sentry.withScope((scope) => {
			scope.setTag("error.type", ErrorType.DATABASE);
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
			Sentry.captureException(error);
		});

		this.logger.error(
			`Prisma error [${errorInfo.code}]: ${errorInfo.message}`,
			errorInfo.isExpected ? undefined : error,
		);

		throw new DatabaseError(
			errorInfo.userMessage,
			errorInfo.code,
			errorInfo.isRetryable,
		);
	}

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

	private classifyPrismaError(
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

		if (error instanceof PrismaClientKnownRequestError) {
			return this.handleKnownPrismaError(error, model, operation);
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

		return {
			code: "UNKNOWN_DATABASE_ERROR",
			message: String(error),
			userMessage: "An unexpected error occurred. Please try again.",
			category: "unknown",
			isExpected: false,
			isRetryable: false,
		};
	}

	private handleKnownPrismaError(
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
			case "P2025":
				return {
					code,
					message: error.message,
					userMessage: `The requested ${model.toLowerCase()} was not found.`,
					category: "not_found",
					isExpected: true,
					isRetryable: false,
				};

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

			case "P2003":
				return {
					code,
					message: error.message,
					userMessage: "This operation would violate a database relationship.",
					category: "constraint_violation",
					isExpected: true,
					isRetryable: false,
				};

			case "P2000":
				return {
					code,
					message: error.message,
					userMessage: "One of the provided values is too long.",
					category: "validation",
					isExpected: true,
					isRetryable: false,
				};

			case "P2006":
				return {
					code,
					message: error.message,
					userMessage: "An invalid value was provided.",
					category: "validation",
					isExpected: true,
					isRetryable: false,
				};

			case "P2020":
			case "P2021":
				return {
					code,
					message: error.message,
					userMessage: "The database operation timed out. Please try again.",
					category: "timeout",
					isExpected: false,
					isRetryable: true,
				};

			case "P2005":
				return {
					code,
					message: error.message,
					userMessage: "Database is currently busy. Please try again.",
					category: "connection",
					isExpected: false,
					isRetryable: true,
				};

			case "P2010":
				return {
					code,
					message: error.message,
					userMessage: "Database configuration error. Please contact support.",
					category: "schema",
					isExpected: false,
					isRetryable: false,
				};

			case "P2018":
				return {
					code,
					message: error.message,
					userMessage: "A required related record was not found.",
					category: "not_found",
					isExpected: true,
					isRetryable: false,
				};

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
