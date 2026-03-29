import { Injectable, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable, from, lastValueFrom } from "rxjs";
import * as Sentry from "@sentry/nestjs";
import { GqlExecutionContext } from "@nestjs/graphql";
import { NestInterceptor } from "@nestjs/common";

@Injectable()
export class SentryGraphQLInterceptor implements NestInterceptor {
	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const gqlCtx = GqlExecutionContext.create(context);
		const info = gqlCtx.getInfo();
		const request = gqlCtx.getContext().req;

		const operationName = info.operation?.name?.value || "anonymous";
		const operationType = info.operation?.operation || "query";
		const query = info.operation?.loc?.source?.body || "";

		if (this.isIntrospectionQuery(operationName, query)) {
			return next.handle();
		}

		const transactionName = `${operationType}.${operationName}`;

		return from(
			Sentry.startSpan(
				{
					name: transactionName,
					op: "graphql.execute",
					attributes: {
						"graphql.operation_name": operationName,
						"graphql.operation_type": operationType,
						"graphql.field_name": info.fieldName,
						"graphql.parent_type": info.parentType?.name || "unknown",
						"graphql.query": this.truncateQuery(query),
						"http.user_agent": request?.headers?.["user-agent"],
					},
				},
				async (span) => {
					const startTime = Date.now();

					try {
						const result = await lastValueFrom(next.handle());

						span.setStatus({ code: 1 });
						span.setAttribute("graphql.status", "success");

						return result;
					} catch (error) {
						span.setStatus({
							code: 2,
							message: error instanceof Error ? error.message : "Unknown error",
						});
						span.setAttribute("graphql.status", "error");

						Sentry.withScope((scope) => {
							scope.setTags({
								"graphql.operation_type": operationType,
								"graphql.operation_name": operationName,
								"graphql.field_name": info.fieldName,
								"graphql.parent_type": info.parentType?.name || "unknown",
							});

							if (request?.user) {
								scope.setUser({
									id: request.user.id || request.user.userId,
									email: request.user.email,
								});
							}

							const variables = this.sanitizeVariables(
								request?.body?.variables || {},
							);
							scope.setExtra("graphql.variables", variables);

							scope.setFingerprint([
								"graphql",
								operationType,
								operationName,
								info.fieldName,
							]);

							Sentry.captureException(error);
						});

						throw error;
					} finally {
						const duration = Date.now() - startTime;
						span.setAttribute("graphql.duration_ms", duration);
						span.setAttribute("graphql.slow", duration > 1000);
					}
				},
			),
		);
	}
	private isIntrospectionQuery(operationName: string, query: string): boolean {
		const introspectionNames = ["IntrospectionQuery", "__schema", "__type"];
		const isIntrospection = introspectionNames.some(
			(name) => operationName.includes(name) || query.includes(name),
		);

		const isPlayground = query.includes("__schema") || query.includes("__type");

		return isIntrospection || isPlayground;
	}

	private truncateQuery(query: string, maxLength = 1000): string {
		if (!query || query.length <= maxLength) return query || "";
		return query.substring(0, maxLength) + "... [truncated]";
	}
	private sanitizeVariables(
		variables: Record<string, any>,
	): Record<string, any> {
		const sensitiveFields = [
			"token",
			"refreshToken",
			"authorization",
			"paymentMethod",
			"secret",
			"apiKey",
			"privateKey",
			"credential",
		];

		const sanitized = JSON.parse(JSON.stringify(variables)); // Deep clone

		const redact = (obj: any, depth = 0, maxDepth = 5) => {
			if (!obj || typeof obj !== "object" || depth >= maxDepth) return;

			for (const key of Object.keys(obj)) {
				const lowerKey = key.toLowerCase();

				if (
					sensitiveFields.some((field) =>
						lowerKey.includes(field.toLowerCase()),
					)
				) {
					obj[key] = "[REDACTED]";
				} else if (typeof obj[key] === "object" && obj[key] !== null) {
					redact(obj[key], depth + 1, maxDepth);
				}
			}
		};

		redact(sanitized);
		return sanitized;
	}
	private getOperationType(query: string): string {
		const trimmed = query.trim();
		if (trimmed.startsWith("mutation")) return "mutation";
		if (trimmed.startsWith("subscription")) return "subscription";
		return "query";
	}
}
