import type { RedactionOptions, RedactedRequestData } from "./redaction.types";

const DEFAULT_REPLACEMENT = "[REDACTED]";
const DEFAULT_MAX_DEPTH = 10;

const DEFAULT_SENSITIVE_KEYS = [
	// Authentication & Security
	"password",
	"secret",
	"token",
	"accessToken",
	"access_token",
	"refreshToken",
	"refresh_token",
	"apiKey",
	"api_key",
	"apikey",
	"auth",
	"authorization",
	"bearer",
	"jwt",
	"session",
	"cookie",
	"csrf",
	"xsrf",

	// Personal Information
	"email",
	"phone",
	"address",
	"passport",
	"ssn",
	"socialsecurity",
	"creditcard",
	"cardnumber",
	"cvv",

	// Database & Infrastructure
	"connectionstring",
	"connection_string",
	"databaseurl",
	"database_url",
	"dbpassword",
	"db_password",
	"dbuser",
	"db_user",
	"privatekey",
	"private_key",
	"encryptionkey",
	"encryption_key",
];

/**
 * Checks if a key name matches sensitive patterns
 */
function isSensitiveKey(key: string, sensitiveKeys: string[]): boolean {
	const lowerKey = key.toLowerCase();
	return sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive));
}

/**
 * Detects if a string value looks like sensitive data (email, phone, etc.)
 */
function looksLikeSensitiveData(value: string): boolean {
	// Email pattern
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
		return true;
	}

	// Phone number pattern (various formats)
	if (/^[\+]?[(]?\d{2,4}[)]?[-\s\.]?[\d\s\-]{7,12}$/.test(value)) {
		return true;
	}

	// Credit card pattern (basic)
	if (/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(value)) {
		return true;
	}

	return false;
}

/**
 * Creates a WeakSet for tracking circular references
 */
function createCircularReferenceTracker() {
	const seen = new WeakSet();

	return {
		seen,
		add: (value: unknown) => {
			if (value && typeof value === "object") {
				seen.add(value);
			}
		},
		has: (value: unknown) => {
			if (!value || typeof value !== "object") {
				return false;
			}
			return seen.has(value);
		},
	};
}

/**
 * Core redaction function with circular reference protection and depth limiting
 */
export function redactSensitiveData<T>(
	obj: T,
	options?: RedactionOptions,
): T {
	const {
		additionalKeys = [],
		replacement = DEFAULT_REPLACEMENT,
		recursive = true,
		redactArrays = true,
		maxDepth = DEFAULT_MAX_DEPTH,
	} = options || {};

	const sensitiveKeys = [
		...DEFAULT_SENSITIVE_KEYS,
		...additionalKeys,
	].map((k) => k.toLowerCase());

	const tracker = createCircularReferenceTracker();

	function redactValue(value: unknown, currentDepth: number): unknown {
		if (value === null || value === undefined) {
			return value;
		}

		// Depth limit check
		if (currentDepth > maxDepth) {
			return "[MAX_DEPTH_EXCEEDED]";
		}

		// Circular reference check
		if (tracker.has(value)) {
			return "[CIRCULAR_REFERENCE]";
		}

		if (typeof value === "string") {
			if (looksLikeSensitiveData(value)) {
				return replacement;
			}
			return value;
		}

		if (Array.isArray(value)) {
			if (redactArrays && value.some((item) => typeof item === "string")) {
				return value.map((item) =>
					typeof item === "string" ? replacement : redactValue(item, currentDepth + 1),
				);
			}
			return value.map((item) => redactValue(item, currentDepth + 1));
		}

		if (typeof value === "object") {
			return redactObject(value as Record<string, unknown>, currentDepth);
		}

		return value;
	}

	function redactObject(
		input: Record<string, unknown>,
		currentDepth: number,
	): Record<string, unknown> {
		// Circular reference check
		if (tracker.has(input)) {
			return { "[CIRCULAR_REFERENCE]": true };
		}
		tracker.add(input);

		const result: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(input)) {
			if (isSensitiveKey(key, sensitiveKeys)) {
				result[key] = replacement;
			} else if (recursive && typeof value === "object" && value !== null) {
				result[key] = redactValue(value, currentDepth + 1);
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	if (typeof obj !== "object" || obj === null) {
		return obj;
	}

	return redactObject(obj as Record<string, unknown>, 0) as T;
}

/**
 * Redacts GraphQL variables
 */
export function redactGraphQLVariables(
	variables: Record<string, unknown> | undefined,
	options?: RedactionOptions,
): Record<string, unknown> | undefined {
	if (!variables) {
		return undefined;
	}

	return redactSensitiveData(variables, options);
}

/**
 * Redacts GraphQL query (returns as-is, query structure is not sensitive)
 */
export function redactGraphQLQuery(query: string): string {
	return query;
}

/**
 * Creates a safe context object with all sensitive data redacted
 */
export function createSafeContext<T extends Record<string, unknown>>(
	context: T,
	options?: RedactionOptions,
): T {
	return redactSensitiveData(context, options);
}

/**
 * Redacts request data (body, query, headers) with appropriate sensitivity levels
 */
export function redactRequestData(request: {
	body?: unknown;
	query?: unknown;
	headers?: Record<string, string>;
}): RedactedRequestData {
	const headerOptions: RedactionOptions = {
		additionalKeys: ["cookie", "authorization", "set-cookie", "x-api-key"],
	};

	return {
		body:
			typeof request.body === "object" && request.body !== null
				? redactSensitiveData(request.body as Record<string, unknown>, headerOptions)
				: request.body,
		query:
			typeof request.query === "object" && request.query !== null
				? redactSensitiveData(request.query as Record<string, unknown>, headerOptions)
				: request.query,
		headers: redactSensitiveData(request.headers || {}, headerOptions) as Record<
			string,
			string
		>,
	};
}

/**
 * Safe JSON parse that handles circular references
 */
export function safeJsonStringify(
	value: unknown,
	replacer?: ((key: string, value: unknown) => unknown) | null,
	space?: string | number,
): string {
	const seen = new WeakSet();

	return JSON.stringify(
		value,
		(key, val) => {
			if (replacer) {
				return replacer(key, val);
			}
			if (val != null && typeof val === "object") {
				if (seen.has(val)) {
					return "[Circular]";
				}
				seen.add(val);
			}
			return val;
		},
		space,
	);
}
