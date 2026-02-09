export interface ApiResponse<T = unknown> {
	data: T;
	message?: string;
	success?: boolean;
}

export interface ApiErrorResponse {
	message: string;
	statusCode: number;
	error?: string;
	errors?: Record<string, string[]>; // Validation errors
}

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: PaginationMeta;
}

export interface RequestOptions extends RequestInit {
	skipAuth?: boolean;
	timeout?: number;
	params?: Record<string, string | number | boolean>;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
