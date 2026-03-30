import * as Sentry from "@sentry/nestjs";
import { redactSensitiveData } from "../redaction/redaction.util";

function safeParse(data: unknown): unknown {
	if (typeof data !== "string") return data;
	try {
		return JSON.parse(data);
	} catch {
		return data;
	}
}

export class SentryModule {
	static init(): void {
		if (!process.env.SENTRY_DSN) {
			console.log("[Sentry] Disabled (no DSN provided)");
			return;
		}

		const isProd = process.env.NODE_ENV === "production";

		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.NODE_ENV ?? "development",
			release: process.env.GITHUB_SHA ?? "unversioned",

			tracesSampleRate: isProd ? 0.1 : 1.0,
			profilesSampleRate: 0, 

			integrations: [
				Sentry.httpIntegration(),
				Sentry.prismaIntegration(),
			],

			beforeSend(event, hint) {
				try {
					if (event.request) {
						if (event.request.data) {
							event.request.data = redactSensitiveData(
								safeParse(event.request.data),
							);
						}

						if (event.request.headers) {
							event.request.headers = redactSensitiveData(event.request.headers, {
								additionalKeys: [
									"cookie",
									"authorization",
									"set-cookie",
									"x-api-key",
								],
							});
						}

						if (event.request.query_string) {
							event.request.query_string = redactSensitiveData(
								event.request.query_string,
							);
						}
					}

					if (event.extra) {
						event.extra = redactSensitiveData(event.extra);
					}

					if (event.breadcrumbs) {
						event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
							if (breadcrumb.data) {
								return {
									...breadcrumb,
									data: redactSensitiveData(breadcrumb.data),
								};
							}
							return breadcrumb;
						});
					}

					if (event.contexts) {
						event.contexts = redactSensitiveData(event.contexts) as typeof event.contexts;
					}

					return event;
				} catch (error) {
					console.error("[Sentry] Redaction failed:", error);
					return event;
				}
			},

			beforeSendTransaction(event) {
				if (
					event.transaction?.includes("IntrospectionQuery") ||
					event.transaction?.includes("__schema") ||
					event.transaction?.includes("__type")
				) {
					return null;
				}

				if (
					event.transaction?.includes("health") ||
					event.transaction?.includes("ping")
				) {
					return null;
				}

				return event;
			},

			beforeBreadcrumb(breadcrumb) {
				if (breadcrumb.data) {
					breadcrumb.data = redactSensitiveData(breadcrumb.data);
				}
				return breadcrumb;
			},
		});

		console.log("[Sentry] Initialized successfully");
	}
}
