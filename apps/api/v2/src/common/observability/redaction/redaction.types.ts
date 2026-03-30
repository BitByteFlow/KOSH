export interface RedactionOptions {
	/** Additional keys to redact beyond the defaults */
	additionalKeys?: string[];
	/** Replacement string for redacted values */
	replacement?: string;
	/** Recursively redact nested objects */
	recursive?: boolean;
	/** Redact array contents (replace with placeholder) */
	redactArrays?: boolean;
	/** Maximum depth for recursive redaction */
	maxDepth?: number;
}

export interface RedactedRequestData {
	body: unknown;
	query: unknown;
	headers: Record<string, string>;
}
