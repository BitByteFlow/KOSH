type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiConfig {
	baseURL: string;
	timeout?: number;
}

export interface RequestConfig extends RequestInit {
	params?: Record<string, string | number | boolean | undefined>;
	timeout?: number;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data: T;
	meta?: {
		total: number;
		hasNext: number;
		hasPrev: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}

export interface ApiError extends Error {
	status?: number;
	statusText?: string;
	response?: ApiResponse<unknown>;
	endpoint?: string;
	method?: HttpMethod;
}

export class ApiClient {
	private baseURL: string;
	private timeout: number;
	private abortControllers: Map<string, AbortController>;

	constructor(config: ApiConfig) {
		this.baseURL = config.baseURL.replace(/\/$/, "");
		this.timeout = config.timeout ?? 30000;
		this.abortControllers = new Map();
	}

	private buildURL(
		endpoint: string,
		params?: Record<string, string | number | boolean | undefined>,
	): string {
		const url = new URL(
			`${this.baseURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`,
		);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== null) {
					url.searchParams.append(key, String(value));
				}
			});
		}

		return url.toString();
	}

	private getStoreId(): string | null {
		const store = localStorage.getItem("kosh_pos_store");
		if (store) {
			try {
				const parsed = JSON.parse(store);
				return parsed?.storeId || null;
			} catch {
				return null;
			}
		}
		return null;
	}

	private createHeaders(customHeaders?: HeadersInit): HeadersInit {
		const storeId = this.getStoreId();

		return {
			"Content-Type": "application/json",
			...(storeId && { "x-store-id": storeId }),
			...customHeaders,
		};
	}

	private createError(
		message: string,
		status?: number,
		statusText?: string,
		response?: ApiResponse<unknown>,
		endpoint?: string,
		method?: HttpMethod,
	): ApiError {
		const error: ApiError = new Error(message);
		error.name = "ApiError";
		error.status = status;
		error.statusText = statusText;
		error.response = response;
		error.endpoint = endpoint;
		error.method = method;

		if (status === 401) {
			localStorage.removeItem("kosh_pos_user");
			localStorage.removeItem("kosh_pos_store");
			localStorage.removeItem("kosh_pos_token");
		}

		return error;
	}

	private async handleResponse<T>(
		response: Response,
		endpoint: string,
		method: HttpMethod,
	): Promise<ApiResponse<T>> {
		const contentType = response.headers.get("content-type");
		const isJson = contentType?.includes("application/json");

		let data: ApiResponse<T>;

		try {
			data = await response.json();
		} catch {
			throw this.createError(
				"Invalid response format",
				response.status,
				response.statusText,
				undefined,
				endpoint,
				method,
			);
		}

		if (!response.ok) {
			throw this.createError(
				data?.message || `Request failed with status ${response.status}`,
				response.status,
				response.statusText,
				data,
				endpoint,
				method,
			);
		}

		return data;
	}

	async request<T>(
		endpoint: string,
		method: HttpMethod = "GET",
		config: RequestConfig = {},
	): Promise<ApiResponse<T>> {
		const {
			params,
			headers,
			timeout = this.timeout,
			signal: externalSignal,
			...initConfig
		} = config;

		const url = this.buildURL(endpoint, params);
		const controller = new AbortController();
		const requestId = `${method}:${endpoint}`;

		this.abortControllers.set(requestId, controller);

		const timeoutId = setTimeout(() => controller.abort(), timeout);

		try {
			const response = await fetch(url, {
				method,
				headers: this.createHeaders(headers),
				signal: controller.signal,
				credentials: "include",
				...initConfig,
				body: initConfig.body ? JSON.stringify(initConfig.body) : undefined,
			});

			clearTimeout(timeoutId);
			this.abortControllers.delete(requestId);

			return await this.handleResponse<T>(response, endpoint, method);
		} catch (error) {
			clearTimeout(timeoutId);
			this.abortControllers.delete(requestId);

			if (error instanceof Error) {
				if (error.name === "AbortError") {
					throw this.createError(
						"Request cancelled",
						undefined,
						undefined,
						undefined,
						endpoint,
						method,
					);
				}
				throw this.createError(
					error.message,
					undefined,
					undefined,
					undefined,
					endpoint,
					method,
				);
			}
			throw this.createError(
				"Unknown error occurred",
				undefined,
				undefined,
				undefined,
				endpoint,
				method,
			);
		}
	}
	get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, "GET", config);
	}

	post<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, "POST", { ...config, body: data });
	}

	put<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, "PUT", { ...config, body: data });
	}

	patch<T>(
		endpoint: string,
		data?: any,
		config?: RequestConfig,
	): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, "PATCH", { ...config, body: data });
	}

	delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
		return this.request<T>(endpoint, "DELETE", config);
	}

	cancel(requestId: string): void {
		const controller = this.abortControllers.get(requestId);
		if (controller) {
			controller.abort();
			this.abortControllers.delete(requestId);
		}
	}

	cancelAll(): void {
		this.abortControllers.forEach((controller) => {
			controller.abort();
		});
		this.abortControllers.clear();
	}
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const apiClient = new ApiClient({
	baseURL: API_BASE_URL,
	timeout: 30000,
});

export default apiClient;
