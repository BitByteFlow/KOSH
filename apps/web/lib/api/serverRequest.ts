import { auth } from "@/app/api/auth/[...nextauth]/auth";
import type { RequestOptions } from "./types";
import { coreRequest } from "./baseRequest";


async function serverRequest<T>(
	endpoint: string,
	options: RequestOptions = {},
): Promise<T> {
	const { skipAuth = false, ...fetchOptions } = options;
	
	let token: string | undefined;
	if (!skipAuth) {
		try {
			const session = await auth();
			token = session?.user?.token;
		} catch (error) {
			console.error("[API] Failed to get session:", error);
		}
	}
	
	return coreRequest<T>(endpoint, fetchOptions, token);
}

export const serverApiClient = {
	get: <T>(endpoint: string, options?: RequestOptions) =>
		serverRequest<T>(endpoint, { ...options, method: "GET" }),
	
	post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
		serverRequest<T>(endpoint, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
		serverRequest<T>(endpoint, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
		serverRequest<T>(endpoint, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		}),
	
	delete: <T>(endpoint: string, options?: RequestOptions) =>
		serverRequest<T>(endpoint, { ...options, method: "DELETE" }),
};

export const apiClient = serverApiClient;
