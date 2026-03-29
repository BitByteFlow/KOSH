export interface RedactionOptions {
	additionalKeys?: string[];
	replacement?: string;
	recursive?: boolean;
	redactArrays?: boolean;
}

const DEFAULT_SENSITIVE_KEYS = [
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

	"email",
	"phone",
	"address",
	"passport",

	// "privatekey",
	// "private_key",
	// "publickey",
	// "public_key",
	// "secretkey",
	// "secret_key",
	// "encryptionkey",
	// "encryption_key",
	// "decryptionkey",
	// "decryption_key",
	// "pem",
	// "cert",
	// "certificate",

	"connectionstring",
	"connection_string",
	"databaseurl",
	"database_url",
	"dbpassword",
	"db_password",
	"dbuser",
	"db_user",
];

export function redactSensitiveData<T extends Record<string, unknown>>(
	obj: T,
	options?: RedactionOptions,
): T {
	const {
		additionalKeys = [],
		replacement = "[REDACTED]",
		recursive = true,
		redactArrays = true,
	} = options || {};

	const sensitiveKeys = [...DEFAULT_SENSITIVE_KEYS, ...additionalKeys].map(
		(k) => k.toLowerCase(),
	);

	function isSensitiveKey(key: string): boolean {
		const lowerKey = key.toLowerCase();
		return sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive));
	}

	function redactValue(value: unknown): unknown {
		if (value === null || value === undefined) {
			return value;
		}

		if (typeof value === "string") {
			if (looksLikeSensitiveData(value)) {
				return replacement;
			}
			return value;
		}

		if (Array.isArray(value)) {
			if (redactArrays) {
				return value.map((item) =>
					typeof item === "string" ? replacement : redactValue(item),
				);
			}
			return value.map((item) => redactValue(item));
		}

		if (typeof value === "object") {
			return redactObject(value as Record<string, unknown>, {
				additionalKeys,
				replacement,
				recursive,
				redactArrays,
			});
		}

		return value;
	}

	function redactObject(
		input: Record<string, unknown>,
		opts: RedactionOptions,
	): Record<string, unknown> {
		const result: Record<string, unknown> = {};

		for (const [key, value] of Object.entries(input)) {
			if (isSensitiveKey(key)) {
				result[key] = replacement;
			} else if (recursive && typeof value === "object" && value !== null) {
				result[key] = redactValue(value);
			} else {
				result[key] = value;
			}
		}

		return result;
	}

	return redactObject(obj, {
		additionalKeys,
		replacement,
		recursive,
		redactArrays,
	}) as T;
}

export function redactGraphQLVariables(
	variables: Record<string, unknown> | undefined,
	options?: RedactionOptions,
): Record<string, unknown> | undefined {
	if (!variables) {
		return undefined;
	}

	return redactSensitiveData(variables, options);
}

export function redactGraphQLQuery(query: string): string {
	return query;
}
function looksLikeSensitiveData(value: string): boolean {
	if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
		return true;
	}

	// Phone number pattern (various formats)
	if (/^[\+]?[(]?\d{2,4}[)]?[-\s\.]?[\d\s\-]{7,12}$/.test(value)) {
		return true;
	}

	return false;
}

export function createSafeContext<T extends Record<string, unknown>>(
	context: T,
	options?: RedactionOptions,
): T {
	return redactSensitiveData(context, options);
}

export function redactRequestData(request: {
	body?: unknown;
	query?: unknown;
	headers?: Record<string, string>;
}): {
	body: unknown;
	query: unknown;
	headers: Record<string, string>;
} {
	const options: RedactionOptions = {
		additionalKeys: ["cookie", "authorization", "set-cookie"],
	};

	return {
		body:
			typeof request.body === "object" && request.body !== null
				? redactSensitiveData(request.body as Record<string, unknown>, options)
				: request.body,
		query:
			typeof request.query === "object" && request.query !== null
				? redactSensitiveData(request.query as Record<string, unknown>, options)
				: request.query,
		headers: redactSensitiveData(request.headers || {}, {
			...options,
			additionalKeys: [
				...(options.additionalKeys || []),
				"cookie",
				"authorization",
				"set-cookie",
			],
		}) as Record<string, string>,
	};
}
