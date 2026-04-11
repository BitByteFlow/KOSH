import {
	Catch,
	ExceptionFilter,
	ArgumentsHost,
	HttpStatus,
	BadRequestException,
	UnauthorizedException,
	ForbiddenException,
	NotFoundException,
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
		const request: any = ctx.getRequest();

		// Handle cases where request might not be properly formed
		if (!request) {
			response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
				error: "Internal server error",
				timestamp: new Date().toISOString(),
			});
			return;
		}

		if (exception instanceof BadRequestException) {
			return response.status(HttpStatus.BAD_REQUEST).json({
				error: "Bad request",
				timestamp: new Date().toISOString(),
			});
		}

		if (exception instanceof UnauthorizedException) {
			const exceptionResponse = exception.getResponse();
			const message = typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
				? (exceptionResponse as any).message
				: 'Unauthorized';

			return response.status(HttpStatus.UNAUTHORIZED).json({
				error: message,
				requestId: request.id || crypto.randomUUID(),
				timestamp: new Date().toISOString(),
			});
		}

		if (exception instanceof ForbiddenException) {
			return response.status(HttpStatus.FORBIDDEN).json({
				error: "Forbidden",
				requestId: request.id || crypto.randomUUID(),
				timestamp: new Date().toISOString(),
			});
		}

		if (exception instanceof NotFoundException) {
			return response.status(HttpStatus.NOT_FOUND).json({
				error: "Not found",
				requestId: request.id || crypto.randomUUID(),
				timestamp: new Date().toISOString(),
			});
		}

		const errorMetadata = this._getErrorMetadata(exception);

		Sentry.withScope((scope) => {
			if (request.user && typeof request.user === 'object') {
				const user = request.user;
				scope.setUser({
					id: user?.id,
					email: user?.email,
					username: user?.username,
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
