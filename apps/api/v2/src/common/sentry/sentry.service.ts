import { Injectable, Inject } from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";
import type { Span, User } from "@sentry/nestjs";

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

@Injectable()
export class SentryService {
	captureException(
		exception: unknown,
		context?: {
			errorType?: ErrorType;
			graphqlContext?: GraphQLErrorContext;
			extra?: Record<string, unknown>;
			user?: User;
			level?: Sentry.SeverityLevel;
		},
	): string | undefined {
		const errorType = context?.errorType || ErrorType.UNKNOWN;

		return Sentry.withScope((scope) => {
			scope.setTag("error.type", errorType);
			scope.setTag("error.is_handled", "true");

			if (context?.user) {
				scope.setUser(context.user);
			}

			if (context?.graphqlContext) {
				const {
					operationName,
					query,
					variables,
					userId,
					storeId,
					fieldName,
					arguments: args,
				} = context.graphqlContext;

				scope.setTransactionName(operationName || "unknown_operation");
				scope.setTag("graphql.operation_name", operationName || "unknown");
				scope.setTag("graphql.field_name", fieldName || "");
				scope.setTag("graphql.user_id", userId || "");
				scope.setTag("graphql.store_id", storeId || "");

				scope.setContext("graphql", {
					operation_name: operationName,
					field_name: fieldName,
					query: this.truncateQuery(query),
					variables: variables ? JSON.stringify(variables) : undefined,
					arguments: args ? JSON.stringify(args) : undefined,
				});
			}

			if (context?.extra) {
				scope.setExtras(context.extra);
			}

			const level =
				context?.level || this.getDefaultLevelForErrorType(errorType);
			scope.setLevel(level);

			return Sentry.captureException(exception);
		});
	}

	startTransaction(
		name: string,
		op: string,
		context?: {
			description?: string;
			tags?: Record<string, string>;
			data?: Record<string, Primitive>;
			user?: User;
		},
	): Span | undefined {
		const transaction = Sentry.startSpan(
			{
				name,
				op,
       attributes: {
        ...context?.data,
        ...(context?.description && {""})
       } 
				description: context?.description,
				tags: context?.tags,
				data: context?.data,
			},
			(span) => span,
		);

		if (context?.user) {
			Sentry.setUser(context.user);
		}

		return transaction;
	}

	startSpan(
		name: string,
		op: string,
		context?: {
			description?: string;
			tags?: Record<string, string>;
			data?: Record<string, Primitive>;
		},
	): Span {
		const span = Sentry.startInactiveSpan({
			name,
			op,
			description: context?.description,
			attributes: {
				...context?.tags,
				...context?.data,
			},
		});

		return span;
	}

	setUser(user: User | null): void {
		Sentry.setUser(user);
	}

	setTag(key: string, value: string): void {
		Sentry.setTag(key, value);
	}

	setTags(tags: Record<string, string>): void {
		Object.entries(tags).forEach(([key, value]) => {
			Sentry.setTag(key, value);
		});
	}

	addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
		Sentry.addBreadcrumb(breadcrumb);
	}

	captureMessage(message: string, level?: Sentry.SeverityLevel): string {
		return Sentry.captureMessage(message, level);
	}

	private getDefaultLevelForErrorType(
		errorType: ErrorType,
	): Sentry.SeverityLevel {
		switch (errorType) {
			case ErrorType.VALIDATION:
				return "warning";
			case ErrorType.AUTHENTICATION:
			case ErrorType.AUTHORIZATION:
				return "warning";
			case ErrorType.NOT_FOUND:
				return "info";
			case ErrorType.BUSINESS_LOGIC:
				return "warning";
			default:
				return "error";
		}
	}

	private truncateQuery(query: string, maxLength = 2000): string {
		if (query.length <= maxLength) {
			return query;
		}
		return query.substring(0, maxLength) + "... (truncated)";
	}
}
