import type { RequestOptions } from "./types";
import { API_CONFIG } from "./config";
import { createErrorFromResponse, NetworkError } from "./errors";
import { buildUrl } from "../utils";

function logRequest(method: string, url: string, options?: RequestOptions) {
	console.log("log request")
	if (process.env.NODE_ENV === "development") {
		console.log(`[API] ${method} ${url}`, options?.body ? JSON.parse(options.body as string) : "");
	}
}

function logResponse(method: string, url: string, status: number, data?: unknown) {
	console.log("log response")
	if (process.env.NODE_ENV === "development") {
		console.log(`[API] ${method} ${url} - ${status}`, data);
	}
}

export async function coreRequest<T>(
	endpoint: string,
	options: RequestOptions = {},
	token?: string,
): Promise<T> {
	const { timeout = API_CONFIG.timeout, params, ...fetchOptions } = options;
	
	const url = buildUrl(endpoint, params);
	const method = fetchOptions.method || "GET";
	
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
	};
	
	if (fetchOptions.headers) {
		const customHeaders = new Headers(fetchOptions.headers);
		customHeaders.forEach((value, key) => {
			headers[key] = value;
		});
	}
	
	if (token) {
		headers.Authorization = `Bearer ${token}`;
	}
	
	logRequest(method, url, fetchOptions);
	
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);
	
	try {
		const response = await fetch(url, {
			...fetchOptions,
			headers,
			signal: controller.signal,
		});
		
		clearTimeout(timeoutId);
		
		const contentType = response.headers.get("content-type");
		const isJson = contentType?.includes("application/json");
		
		let data: unknown;
		if (isJson) {
			data = await response.json();
		} else {
			data = await response.text();
		}
		
		logResponse(method, url, response.status, data);
		
		if (!response.ok) {
			throw createErrorFromResponse(response.status, data as any);
		}
		
		return data as T;
	} catch (error) {
		clearTimeout(timeoutId);
		
		if (error instanceof Error && error.name === "AbortError") {
			throw new NetworkError("Request timeout");
		}
		
		if (error instanceof TypeError) {
			throw new NetworkError("Network request failed");
		}
		
		throw error;
	}
}

export const baseApiClient = {
	get: <T>(endpoint: string, options?: RequestOptions) =>
		coreRequest<T>(endpoint, { ...options, method: "GET" }),
	
	post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
		coreRequest<T>(endpoint, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
		coreRequest<T>(endpoint, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
		coreRequest<T>(endpoint, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	delete: <T>(endpoint: string, options?: RequestOptions) =>
		coreRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
