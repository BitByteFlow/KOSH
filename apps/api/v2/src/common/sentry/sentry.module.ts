import { Module, Global } from "@nestjs/common";
import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

@Global()
@Module({})
export class SentryModule {
	static init(): void {
		if (!process.env.SENTRY_DSN) {
			console.log("[Sentry] Disabled (no SENTRY_DSN)");
			return;
		}

		const isProd = process.env.NODE_ENV === "production";

		Sentry.init({
			dsn: process.env.SENTRY_DSN,
			environment: process.env.NODE_ENV || "development",
			release: process.env.GITHUB_SHA || "unversioned",

			tracesSampleRate: isProd ? 0.1 : 1.0,
			profilesSampleRate: isProd ? 0.05 : 1.0,

			integrations: [
				nodeProfilingIntegration(),
				Sentry.httpIntegration(),
				Sentry.prismaIntegration(),
			],

			beforeSend: (event) => {
				if (!isProd) return null;

				if (event.request?.data) {
					try {
						const parsed =
							typeof event.request.data === "string"
								? JSON.parse(event.request.data)
								: event.request.data;

						if (parsed?.variables) {
							parsed.variables = this.redactVariables(parsed.variables);
						}
						event.request.data = parsed;
					} catch {
						event.request.data = "[REDACTED]";
					}
				}

				return event;
			},

			beforeSendTransaction: (event) => {
				if (event.transaction?.includes("IntrospectionQuery")) {
					return null;
				}
				return event;
			},
		});
	}

	private static redactVariables(variables: any): any {
		const sensitive = [
			"password",
			"token",
			"secret",
			"apiKey",
			"authorization",
		];

		const redact = (obj: any) => {
			if (!obj || typeof obj !== "object") return obj;

			for (const key of Object.keys(obj)) {
				if (sensitive.some((s) => key.toLowerCase().includes(s))) {
					obj[key] = "[REDACTED]";
				} else if (typeof obj[key] === "object") {
					redact(obj[key]);
				}
			}
			return obj;
		};

		return redact({ ...variables });
	}
}
