import { Injectable } from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";
import type { Span, User, SeverityLevel, Scope } from "@sentry/nestjs";
import type { CaptureExceptionContext, SpanContext } from "./types";

@Injectable()
export class SentryService {
	captureException(
		exception: unknown,
		context?: CaptureExceptionContext,
	): string | undefined {
		const errorType = context?.errorType ?? "UNKNOWN_ERROR";

		return Sentry.withScope((scope) => {
			scope.setTag("error.type", errorType);
			scope.setTag("error.is_handled", "true");

			if (context?.user) {
				this._setUserOnScope(scope, context.user);
			}

			if (context?.graphqlContext) {
				this._enrichWithGraphQlContext(scope, context.graphqlContext);
			}

			if (context?.extra) {
				scope.setExtras(context.extra);
			}

			const level =
				context?.level ?? this._getDefaultLevelForErrorType(errorType);
			scope.setLevel(level);

			return Sentry.captureException(exception);
		});
	}

	startSpan<T>(
		name: string,
		op: string,
		fn: (span: Span) => T,
		context?: SpanContext,
	): T {
		return Sentry.startSpan(
			{
				name,
				op,
				attributes: this._buildAttributes(context) as Record<string, string | number | boolean | undefined>,
			},
			fn,
		);
	}
	async startSpanAsync<T>(
		name: string,
		op: string,
		fn: (span: Span) => Promise<T>,
		context?: SpanContext,
	): Promise<T> {
		return Sentry.startSpan(
			{
				name,
				op,
				attributes: this._buildAttributes(context) as Record<string, string | number | boolean | undefined>,
			},
			fn,
		);
	}

	startInactiveSpan(
		name: string,
		op: string,
		context?: SpanContext,
	): Span {
		return Sentry.startInactiveSpan({
			name,
			op,
			attributes: this._buildAttributes(context) as Record<string, string | number | boolean | undefined>,
		});
	}

	setUser(user: User | null): void {
		Sentry.setUser(user);
	}

	setTag(key: string, value: string): void {
		Sentry.setTag(key, value);
	}

	setTags(tags: Record<string, string>): void {
		Sentry.setTags(tags);
	}

	addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
		Sentry.addBreadcrumb(breadcrumb);
	}

	captureMessage(message: string, level: SeverityLevel = "info"): string {
		return Sentry.captureMessage(message, level);
	}

	getActiveSpan(): Span | undefined {
		return Sentry.getActiveSpan();
	}

	withScope<T>(callback: (scope: Scope) => T): T {
		return Sentry.withScope(callback);
	}

	withIsolationScope<T>(callback: (scope: Scope) => T): T {
		return Sentry.withIsolationScope(callback);
	}

	private _buildAttributes(context?: SpanContext): Record<string, unknown> {
		const attributes: Record<string, unknown> = {};

		if (context?.description) {
			attributes.description = context.description;
		}

		if (context?.tags) {
			Object.assign(attributes, context.tags);
		}

		if (context?.data) {
			Object.assign(attributes, context.data);
		}

		return attributes;
	}

	private _setUserOnScope(scope: Scope, user: User): void {
		scope.setUser(user);
	}

	private _enrichWithGraphQlContext(
		scope: Scope,
		graphqlContext: {
			operationName: string;
			query: string;
			variables?: Record<string, unknown>;
			userId?: string;
			storeId?: string;
			fieldName?: string;
			arguments?: Record<string, unknown>;
		},
	): void {
		const {
			operationName,
			query,
			variables,
			userId,
			storeId,
			fieldName,
			arguments: args,
		} = graphqlContext;

		scope.setTransactionName(operationName || "unknown_operation");

		scope.setTags({
			"graphql.operation_name": operationName || "unknown",
			"graphql.field_name": fieldName || "",
			"graphql.user_id": userId || "",
			"graphql.store_id": storeId || "",
		});

		scope.setContext("graphql", {
			operation_name: operationName || "unknown",
			field_name: fieldName || "",
			query: this._truncateQuery(query),
			variables: variables || undefined,
			arguments: args || undefined,
		});
	}

	private _getDefaultLevelForErrorType(errorType: string): SeverityLevel {
		switch (errorType) {
			case "VALIDATION_ERROR":
			case "AUTHENTICATION_ERROR":
			case "AUTHORIZATION_ERROR":
			case "BUSINESS_LOGIC_ERROR":
				return "warning";

			case "NOT_FOUND_ERROR":
				return "info";

			default:
				return "error";
		}
	}

	private _truncateQuery(query: string, maxLength = 2000): string {
		if (!query) return "";
		return query.length <= maxLength
			? query
			: query.slice(0, maxLength) + "... (truncated)";
	}
}
