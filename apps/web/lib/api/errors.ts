import type { ApiErrorResponse } from "./types";

export class ApiError extends Error {
	constructor(
		message: string,
		public statusCode: number,
		public response?: ApiErrorResponse,
	) {
		super(message);
		this.name = "ApiError";
		Object.setPrototypeOf(this, ApiError.prototype);
	}
}

export class ValidationError extends ApiError {
	constructor(
		message: string,
		public errors?: Record<string, string[]>,
	) {
		super(message, 400);
		this.name = "ValidationError";
		Object.setPrototypeOf(this, ValidationError.prototype);
	}
}

export class AuthError extends ApiError {
	constructor(message = "Authentication required") {
		super(message, 401);
		this.name = "AuthError";
		Object.setPrototypeOf(this, AuthError.prototype);
	}
}

export class ForbiddenError extends ApiError {
	constructor(message = "Access forbidden") {
		super(message, 403);
		this.name = "ForbiddenError";
		Object.setPrototypeOf(this, ForbiddenError.prototype);
	}
}

export class NotFoundError extends ApiError {
	constructor(message = "Resource not found") {
		super(message, 404);
		this.name = "NotFoundError";
		Object.setPrototypeOf(this, NotFoundError.prototype);
	}
}

export class ServerError extends ApiError {
	constructor(message = "Internal server error", statusCode = 500) {
		super(message, statusCode);
		this.name = "ServerError";
		Object.setPrototypeOf(this, ServerError.prototype);
	}
}

export class NetworkError extends Error {
	constructor(message = "Network request failed") {
		super(message);
		this.name = "NetworkError";
		Object.setPrototypeOf(this, NetworkError.prototype);
	}
}

export function createErrorFromResponse(
	statusCode: number,
	errorData?: ApiErrorResponse,
): ApiError {
	const message = errorData?.message || "An error occurred";

	switch (statusCode) {
		case 400:
			return new ValidationError(message, errorData?.errors);
		case 401:
			return new AuthError(message);
		case 403:
			return new ForbiddenError(message);
		case 404:
			return new NotFoundError(message);
		case 500:
		case 502:
		case 503:
		case 504:
			return new ServerError(message, statusCode);
		default:
			return new ApiError(message, statusCode, errorData);
	}
}

export function getUserFriendlyErrorMessage(error: unknown): string {
	if (error instanceof ValidationError) {
		return error.message;
	}
	if (error instanceof AuthError) {
		return "Please log in to continue";
	}
	if (error instanceof ForbiddenError) {
		return "You don't have permission to perform this action";
	}
	if (error instanceof NotFoundError) {
		return "The requested resource was not found";
	}
	if (error instanceof ServerError) {
		return "Something went wrong on our end. Please try again later";
	}
	if (error instanceof NetworkError) {
		return "Network error. Please check your connection";
	}
	if (error instanceof Error) {
		return error.message;
	}
	return "An unexpected error occurred";
}
