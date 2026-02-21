import { Maybe } from "@/gql/graphql";
import { toast } from "sonner";

export interface GraphQLResponse<T> {
	success: boolean;
	message?: Maybe<string>;
	data?: Maybe<T>;
	meta?: Maybe<any>;
}

export function parseGraphQLResponse<T>(
	response: GraphQLResponse<T> | undefined | null,
	defaultDataValue: T,
	options?: {
		onSuccess?: (response: GraphQLResponse<T>) => void;
		onError?: (message: string) => void;
		showError?: boolean;
	}
): GraphQLResponse<T> {
	if (response?.success) {
		options?.onSuccess?.(response);
		return response;
	}

	const message = response?.message || "An unexpected error occurred while fetching data.";

	if (options?.showError) {
		toast.error(message);
	}

	options?.onError?.(message);

	return {
		success: false,
		message: message,
		data: defaultDataValue,
		meta: response?.meta || null
	};
}

export function parseGraphQLListResponse<T>(
	response: (GraphQLResponse<Array<T>> & { meta?: any }) | undefined | null,
	options?: {
		onSuccess?: (response: GraphQLResponse<Array<T>>) => void;
		onError?: (message: string) => void;
		showError?: boolean;
	}
): GraphQLResponse<Array<T>> {
	return parseGraphQLResponse(response, [] as Array<T>, options);
}
