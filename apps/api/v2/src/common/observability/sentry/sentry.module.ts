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
			tracesSampleRate: isProd
				? parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1")
				: 1.0,

			profilesSampleRate: isProd
				? parseFloat(process.env.SENTRY_PROFILES_SAMPLE_RATE || "0.1")
				: 0,

			integrations: [
				Sentry.httpIntegration(),
				Sentry.prismaIntegration(),
				Sentry.graphqlIntegration(),
				Sentry.postgresIntegration(),
			],

			beforeSendTransaction(event) {
				const transactionName = event.transaction || "";

				if (
					transactionName.includes("IntrospectionQuery") ||
					transactionName.includes("__schema") ||
					transactionName.includes("__type")
				) {
					return null;
				}

				if (
					transactionName.includes("health") ||
					transactionName.includes("ping")
				) {
					return null;
				}

				if (event.contexts?.trace?.data?.["http.method"] === "OPTIONS") {
					return null;
				}

				return event;
			},

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
									"x-store-id",
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

			// Redact breadcrumbs
			beforeBreadcrumb(breadcrumb) {
				if (breadcrumb.data) {
					breadcrumb.data = redactSensitiveData(breadcrumb.data);
				}
				return breadcrumb;
			},

			ignoreErrors: [
				/top.*extensions.*content.*script/i,
				/can't find variable: gwt/i,
				/Non-Error promise rejection captured/i,
				/Loading chunk/i,
				/Loading module/i,
				/NetworkError/i,
				/Network request failed/i,
				/Failed to fetch/i,
				/Unknown type/i,
			],

			tracePropagationTargets: [
				"localhost",
				/https:\/\/.*\.sentry\.io\/sentry/,
			],

			sendDefaultPii: false,
		});

		console.log("[Sentry] Initialized successfully");
		console.log(`[Sentry] Environment: ${process.env.NODE_ENV ?? "development"}`);
		console.log(`[Sentry] Traces Sample Rate: ${isProd ? process.env.SENTRY_TRACES_SAMPLE_RATE || "0.1" : "1.0"}`);
		console.log(`[Sentry] Profiles Sample Rate: ${isProd ? process.env.SENTRY_PROFILES_SAMPLE_RATE || "0.1" : "0"}`);
	}
}
