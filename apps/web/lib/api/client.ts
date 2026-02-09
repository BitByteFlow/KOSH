import { coreRequest } from "./baseRequest";
import type { RequestOptions } from "./types";


async function clientRequest<T>(
	endpoint: string,
	token: string | undefined,
	options: RequestOptions = {},
): Promise<T> {
	return coreRequest<T>(endpoint, options, token);
}

export const clientApiClient = {
	get: <T>(endpoint: string, token: string | undefined, options?: RequestOptions) =>
		clientRequest<T>(endpoint, token, { ...options, method: "GET" }),
	
	post: <T>(endpoint: string, token: string | undefined, body?: unknown, options?: RequestOptions) =>
		clientRequest<T>(endpoint, token, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	put: <T>(endpoint: string, token: string | undefined, body?: unknown, options?: RequestOptions) =>
		clientRequest<T>(endpoint, token, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	patch: <T>(endpoint: string, token: string | undefined, body?: unknown, options?: RequestOptions) =>
		clientRequest<T>(endpoint, token, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	delete: <T>(endpoint: string, token: string | undefined, options?: RequestOptions) =>
		clientRequest<T>(endpoint, token, { ...options, method: "DELETE" }),
};

// Legacy export (deprecated - use serverApiClient or clientApiClient)
