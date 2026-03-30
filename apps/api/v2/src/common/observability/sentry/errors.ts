import { GraphQLError } from "graphql";

export enum ErrorCode {
	VALIDATION_ERROR = "BAD_USER_INPUT",
	REQUIRED_FIELD = "REQUIRED_FIELD",
	INVALID_FORMAT = "INVALID_FORMAT",
	INVALID_RANGE = "INVALID_RANGE",

	AUTHENTICATION_ERROR = "UNAUTHENTICATED",
	INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
	TOKEN_EXPIRED = "TOKEN_EXPIRED",
	TOKEN_INVALID = "TOKEN_INVALID",

	AUTHORIZATION_ERROR = "FORBIDDEN",
	INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS",
	RESOURCE_ACCESS_DENIED = "RESOURCE_ACCESS_DENIED",

	NOT_FOUND_ERROR = "NOT_FOUND",
	RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
	USER_NOT_FOUND = "USER_NOT_FOUND",

	BUSINESS_LOGIC_ERROR = "BUSINESS_LOGIC_ERROR",
	CONFLICT_ERROR = "CONFLICT",
	INVALID_STATE = "INVALID_STATE",
	OPERATION_NOT_ALLOWED = "OPERATION_NOT_ALLOWED",
	INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS",
	DUPLICATE_ENTRY = "DUPLICATE_ENTRY",

	DATABASE_ERROR = "DATABASE_ERROR",
	DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
	DATABASE_TIMEOUT = "DATABASE_TIMEOUT",

	INTERNAL_ERROR = "INTERNAL_SERVER_ERROR",
	RESOLVER_ERROR = "RESOLVER_ERROR",
	UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface ErrorOptions {
	context?: Record<string, unknown>;
	cause?: unknown;
	sendToSentry?: boolean;
	tags?: Record<string, string>;
}
export abstract class ApplicationError extends GraphQLError {
	public readonly type: string;
	public readonly code: ErrorCode;
	public readonly context?: Record<string, unknown>;
	public readonly cause?: unknown;
	public readonly sendToSentry: boolean;
	public readonly tags?: Record<string, string>;

	constructor(
		message: string,
		options: {
			type: string;
			code: ErrorCode;
			context?: Record<string, unknown>;
			cause?: unknown;
			sendToSentry?: boolean;
			tags?: Record<string, string>;
		},
	) {
		super(message, {
			extensions: {
				code: options.code,
				type: options.type,
				...(options.context ? { context: options.context } : {}),
			},
		});

		this.type = options.type;
		this.code = options.code;
		this.context = options.context;
		this.cause = options.cause;
		this.sendToSentry = options.sendToSentry ?? true;
		this.tags = options.tags;

		// Capture stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	toGraphQLError(): GraphQLError {
		return this;
	}
}

export class ValidationError extends ApplicationError {
	constructor(
		message: string,
		options?: {
			field?: string;
			context?: Record<string, unknown>;
			cause?: unknown;
		},
	) {
		super(message, {
			type: "VALIDATION_ERROR",
			code: ErrorCode.VALIDATION_ERROR,
			context: options?.field
				? { field: options.field, ...options.context }
				: options?.context,
			cause: options?.cause,
			sendToSentry: true,
			tags: { "error.category": "validation" },
		});
	}
}

export class RequiredFieldError extends ValidationError {
	constructor(fieldName: string) {
		super(`The field '${fieldName}' is required.`, {
			field: fieldName,
		});
	}
}

export class InvalidFormatError extends ValidationError {
	constructor(fieldName: string, expectedFormat: string) {
		super(
			`The field '${fieldName}' has an invalid format. Expected: ${expectedFormat}`,
			{
				field: fieldName,
				context: { expectedFormat },
			},
		);
	}
}

export class AuthenticationError extends ApplicationError {
	constructor(
		message = "You must be logged in to perform this action.",
		options?: {
			context?: Record<string, unknown>;
			cause?: unknown;
		},
	) {
		super(message, {
			type: "AUTHENTICATION_ERROR",
			code: ErrorCode.AUTHENTICATION_ERROR,
			context: options?.context,
			cause: options?.cause,
			sendToSentry: true,
			tags: { "error.category": "authentication" },
		});
	}
}

export class InvalidCredentialsError extends AuthenticationError {
	constructor() {
		super("Invalid email or password.");
	}
}

export class TokenExpiredError extends AuthenticationError {
	constructor() {
		super("Your session has expired. Please log in again.");
	}
}

export class AuthorizationError extends ApplicationError {
	constructor(
		message = "You do not have permission to perform this action.",
		options?: {
			requiredPermission?: string;
			context?: Record<string, unknown>;
			cause?: unknown;
		},
	) {
		super(message, {
			type: "AUTHORIZATION_ERROR",
			code: ErrorCode.AUTHORIZATION_ERROR,
			context: options
				? {
						requiredPermission: options.requiredPermission,
						...options.context,
					}
				: undefined,
			cause: options?.cause,
			sendToSentry: true,
			tags: { "error.category": "authorization" },
		});
	}
}

export class InsufficientPermissionsError extends AuthorizationError {
	constructor(requiredPermission: string) {
		super(`You need the following permission: ${requiredPermission}`, {
			requiredPermission,
		});
	}
}

export class NotFoundError extends ApplicationError {
	constructor(
		message: string,
		options?: {
			resourceType?: string;
			resourceId?: string;
			context?: Record<string, unknown>;
			cause?: unknown;
		},
	) {
		super(message, {
			type: "NOT_FOUND_ERROR",
			code: ErrorCode.NOT_FOUND_ERROR,
			context: options
				? {
						resourceType: options.resourceType,
						resourceId: options.resourceId,
						...options.context,
					}
				: undefined,
			cause: options?.cause,
			sendToSentry: true,
			tags: { "error.category": "not_found" },
		});
	}
}

export class ResourceNotFoundError extends NotFoundError {
	constructor(resourceType: string, id: string | number) {
		super(`${resourceType} with ID '${id}' not found.`, {
			resourceType,
			resourceId: String(id),
		});
	}
}

export class BusinessLogicError extends ApplicationError {
	constructor(
		message: string,
		options?: {
			context?: Record<string, unknown>;
			cause?: unknown;
			code?: ErrorCode;
		},
	) {
		super(message, {
			type: "BUSINESS_LOGIC_ERROR",
			code: options?.code || ErrorCode.BUSINESS_LOGIC_ERROR,
			context: options?.context,
			cause: options?.cause,
			sendToSentry: true,
			tags: { "error.category": "business_logic" },
		});
	}
}

export class ConflictError extends BusinessLogicError {
	constructor(
		message: string,
		options?: { context?: Record<string, unknown>; cause?: unknown },
	) {
		super(message, {
			...options,
			code: ErrorCode.CONFLICT_ERROR,
		});
	}
}

export class DuplicateEntryError extends ConflictError {
	constructor(fieldName: string, value: string) {
		super(`A record with this ${fieldName} already exists: ${value}`, {
			context: { field: fieldName, value },
		});
	}
}

export class InsufficientFundsError extends BusinessLogicError {
	constructor(
		required: number,
		available: number,
		currency = "USD",
	) {
		super(
			`Insufficient funds. Required: ${currency} ${required}, Available: ${currency} ${available}`,
			{
				context: { required, available, currency },
				code: ErrorCode.INSUFFICIENT_FUNDS,
			},
		);
	}
}

export class InvalidStateError extends BusinessLogicError {
	constructor(
		message: string,
		options?: { context?: Record<string, unknown>; cause?: unknown },
	) {
		super(message, {
			...options,
			code: ErrorCode.INVALID_STATE,
		});
	}
}

export class OperationNotAllowedError extends BusinessLogicError {
	constructor(operation: string, reason: string) {
		super(`Operation '${operation}' is not allowed: ${reason}`, {
			context: { operation, reason },
			code: ErrorCode.OPERATION_NOT_ALLOWED,
		});
	}
}

export class DatabaseError extends ApplicationError {
	constructor(
		message: string,
		options?: {
			context?: Record<string, unknown>;
			cause?: unknown;
			code?: ErrorCode;
		},
	) {
		super(message, {
			type: "DATABASE_ERROR",
			code: options?.code || ErrorCode.DATABASE_ERROR,
			context: options?.context,
			cause: options?.cause,
			sendToSentry: true,
			tags: { "error.category": "database" },
		});
	}
}

export class DatabaseConnectionError extends DatabaseError {
	constructor() {
		super("Unable to connect to the database. Please try again later.", {
			code: ErrorCode.DATABASE_CONNECTION_ERROR,
		});
	}
}

export class DatabaseTimeoutError extends DatabaseError {
	constructor() {
		super("The database operation timed out. Please try again.", {
			code: ErrorCode.DATABASE_TIMEOUT,
		});
	}
}

export class InternalError extends ApplicationError {
	constructor(
		message = "An unexpected error occurred. Please try again later.",
		options?: {
			context?: Record<string, unknown>;
			cause?: unknown;
		},
	) {
		super(message, {
			type: "INTERNAL_ERROR",
			code: ErrorCode.INTERNAL_ERROR,
			context: options?.context,
			cause: options?.cause,
			sendToSentry: true,
			tags: { "error.category": "internal" },
		});
	}
}

export class ResolverError extends InternalError {
	constructor(
		message: string,
		options?: {
			context?: Record<string, unknown>;
			cause?: unknown;
		},
	) {
		super(message, {
			...options,
			context: { ...options?.context, error_source: "resolver" },
		});
	}
}
