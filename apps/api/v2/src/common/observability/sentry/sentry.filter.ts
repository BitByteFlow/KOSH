import {
	Catch,
	ExceptionFilter,
	ArgumentsHost,
	HttpStatus,
	BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import * as Sentry from "@sentry/nestjs";
import type { SeverityLevel } from "@sentry/nestjs";
import { ApplicationError } from "./errors";
import { redactRequestData } from "../redaction/redaction.util";

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest();

		if (exception instanceof BadRequestException) {
			return response.status(HttpStatus.BAD_REQUEST).json({
				error: "Bad request",
				timestamp: new Date().toISOString(),
			});
		}

		const errorMetadata = this._getErrorMetadata(exception);

		Sentry.withScope((scope) => {
			if (request.user) {
				scope.setUser({
					id: request.user.id,
					email: request.user.email,
					username: request.user.username,
				});
			}

			const redactedRequest = redactRequestData({
				body: request.body,
				query: request.query,
				headers: request.headers,
			});

			scope.setContext("request", {
				url: request.url,
				method: request.method,
				headers: redactedRequest.headers,
				query_string: redactedRequest.query,
				body: redactedRequest.body,
			});

			scope.setTags({
				environment: process.env.NODE_ENV || "development",
				service: "kosh-api-v2",
				error_type: errorMetadata.errorType,
				http_status: String(errorMetadata.statusCode),
			});
			scope.setLevel(errorMetadata.level);

			Sentry.captureException(exception);
		});

		response.status(errorMetadata.statusCode).json({
			error: this._getErrorMessage(errorMetadata.statusCode),
			requestId: request.id || crypto.randomUUID(),
			timestamp: new Date().toISOString(),
			...(process.env.NODE_ENV === "development" && {
				stack: exception instanceof Error ? exception.stack : undefined,
			}),
		});
	}

	private _getErrorMetadata(exception: unknown): {
		errorType: string;
		level: SeverityLevel;
		statusCode: number;
	} {
		const defaultMetadata = {
			errorType: "UNKNOWN_ERROR",
			level: "error" as SeverityLevel,
			statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
		};

		if (!(exception instanceof ApplicationError)) {
			return defaultMetadata;
		}

		const appError = exception as ApplicationError;

		switch (appError.type) {
			case "VALIDATION_ERROR":
				return {
					errorType: appError.type,
					level: "warning",
					statusCode: HttpStatus.BAD_REQUEST,
				};

			case "AUTHENTICATION_ERROR":
				return {
					errorType: appError.type,
					level: "warning",
					statusCode: HttpStatus.UNAUTHORIZED,
				};

			case "AUTHORIZATION_ERROR":
				return {
					errorType: appError.type,
					level: "warning",
					statusCode: HttpStatus.FORBIDDEN,
				};

			case "NOT_FOUND_ERROR":
				return {
					errorType: appError.type,
					level: "info",
					statusCode: HttpStatus.NOT_FOUND,
				};

			case "BUSINESS_LOGIC_ERROR":
			case "CONFLICT_ERROR":
				return {
					errorType: appError.type,
					level: "warning",
					statusCode: HttpStatus.CONFLICT,
				};

			case "DATABASE_ERROR":
				return {
					errorType: appError.type,
					level: "error",
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				};

			default:
				return {
					errorType: appError.type,
					level: "error",
					statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
				};
		}
	}

	private _getErrorMessage(statusCode: number): string {
		switch (statusCode) {
			case HttpStatus.BAD_REQUEST:
				return "Bad request";
			case HttpStatus.UNAUTHORIZED:
				return "Unauthorized";
			case HttpStatus.FORBIDDEN:
				return "Forbidden";
			case HttpStatus.NOT_FOUND:
				return "Resource not found";
			case HttpStatus.CONFLICT:
				return "Conflict";
			case HttpStatus.INTERNAL_SERVER_ERROR:
			default:
				return "Internal server error";
		}
	}
}
