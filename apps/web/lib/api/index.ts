export { serverApiClient, clientApiClient, apiClient } from "./client";
export { API_CONFIG, API_ENDPOINTS } from "./config";

export type {
	ApiResponse,
	ApiErrorResponse,
	PaginatedResponse,
	PaginationMeta,
	RequestOptions,
	HttpMethod,
} from "./types";

export {
	ApiError,
	ValidationError,
	AuthError,
	ForbiddenError,
	NotFoundError,
	ServerError,
	NetworkError,
	createErrorFromResponse,
	getUserFriendlyErrorMessage,
} from "./errors";


export async function ApiService<T>(func: () => Promise<T>): Promise<T> {
	try {
		return await func();
	} catch (error) {
		throw error;
	}
}