import type { SeverityLevel, User } from "@sentry/nestjs";

export enum ErrorType {
	VALIDATION = "VALIDATION_ERROR",
	RESOLVER = "RESOLVER_ERROR",
	BUSINESS_LOGIC = "BUSINESS_LOGIC_ERROR",
	DATABASE = "DATABASE_ERROR",
	AUTHENTICATION = "AUTHENTICATION_ERROR",
	AUTHORIZATION = "AUTHORIZATION_ERROR",
	NOT_FOUND = "NOT_FOUND_ERROR",
	UNKNOWN = "UNKNOWN_ERROR",
}

export interface GraphQLErrorContext {
	operationName: string;
	query: string;
	variables?: Record<string, unknown>;
	userId?: string;
	storeId?: string;
	fieldName?: string;
	arguments?: Record<string, unknown>;
}

export interface CaptureExceptionContext {
	errorType?: ErrorType;
	graphqlContext?: GraphQLErrorContext;
	extra?: Record<string, unknown>;
	user?: User;
	level?: SeverityLevel;
}

export interface SpanContext {
	description?: string;
	tags?: Record<string, string>;
	data?: Record<string, string | number | boolean | undefined>;
	user?: User;
}

export interface PrismaErrorContext {
	operation?: string;
	model?: string;
	args?: Record<string, unknown>;
	userId?: string;
	query?: string;
}
