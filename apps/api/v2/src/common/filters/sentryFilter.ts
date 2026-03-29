import {
	Catch,
	ExceptionFilter,
	ArgumentsHost,
	HttpStatus,
	BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import * as Sentry from "@sentry/nestjs";
import { ApplicationError } from "../sentry/errors";

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

		let errorType = "UNKNOWN_ERROR";
		let level: Sentry.SeverityLevel = "error";
		let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;

		if (exception instanceof ApplicationError) {
			errorType = exception.type;

			switch (exception.type) {
				case "VALIDATION_ERROR":
					level = "warning";
					statusCode = HttpStatus.BAD_REQUEST;
					break;
				case "AUTHENTICATION_ERROR":
					level = "warning";
					statusCode = HttpStatus.UNAUTHORIZED;
					break;
				case "AUTHORIZATION_ERROR":
					level = "warning";
					statusCode = HttpStatus.FORBIDDEN;
					break;
				case "NOT_FOUND_ERROR":
					level = "info";
					statusCode = HttpStatus.NOT_FOUND;
					break;
				case "BUSINESS_LOGIC_ERROR":
				case "CONFLICT_ERROR":
					level = "warning";
					statusCode = HttpStatus.CONFLICT;
					break;
				case "DATABASE_ERROR":
					level = "error";
					statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
					break;
				default:
					level = "error";
					statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
			}
		}

		Sentry.withScope((scope) => {
			if (request.user) {
				scope.setUser({
					id: request.user.id,
					email: request.user.email,
				});
			}

			scope.setContext("request", {
				url: request.url,
				method: request.method,
				headers: request.headers,
				query_string: request.query,
			});

			scope.setTags({
				environment: process.env.NODE_ENV || "development",
				service: "kosh-api-v2",
				error_type: errorType,
			});

			scope.setLevel(level);

			Sentry.captureException(exception);
		});

		response.status(statusCode).json({
			error: this.getErrorMessage(statusCode),
			requestId: request.id || crypto.randomUUID(),
			timestamp: new Date().toISOString(),
			...(process.env.NODE_ENV === "development" && {
				stack: exception instanceof Error ? exception.stack : undefined,
			}),
		});
	}

	private getErrorMessage(statusCode: number): string {
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
			default:
				return "Internal server error";
		}
	}
}
