import { gql } from "@apollo/client";
import { clientApiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/config";

export const GET_PENDING_MEMBER_REQUESTS = gql`
	query GetPendingJoinRequests {
		getPendingJoinRequests {
			success
			message
			data {
				id
				storeId
				userId
				status
				createdAt
				updatedAt
				user {
					id
					username
					email
				}
			}
		}
	}
`;

export const GET_ALL_MEMBER_REQUESTS = gql`
	query GetAllJoinRequests {
		getAllJoinRequests {
			success
			message
			data {
				id
				storeId
				userId
				status
				createdAt
				updatedAt
				user {
					id
					username
					email
				}
			}
		}
	}
`;

export const GET_USER_JOIN_REQUEST = gql`
	query GetUserJoinRequest {
		getUserJoinRequest {
			success
			message
			data {
				id
				storeId
				userId
				status
				createdAt
				updatedAt
			}
		}
	}
`;

export const CREATE_JOIN_REQUEST = gql`
	mutation CreateJoinRequest {
		createJoinRequest {
			success
			message
			data {
				id
				storeId
				userId
				status
				createdAt
				updatedAt
			}
		}
	}
`;

export const HANDLE_JOIN_REQUEST = gql`
	mutation HandleJoinRequest($requestId: ID!, $input: HandleJoinRequestInput!) {
		handleJoinRequest(requestId: $requestId, input: $input) {
			success
			message
			data {
				id
				storeId
				userId
				status
				createdAt
				updatedAt
			}
		}
	}
`;

export const CANCEL_JOIN_REQUEST = gql`
	mutation CancelJoinRequest {
		cancelJoinRequest {
			success
			message
		}
	}
`;

export interface MemberRequest {
	id: string;
	storeId: string;
	userId: string;
	status: "PENDING" | "ACCEPTED" | "REJECTED";
	createdAt: string;
	updatedAt: string;
	user?: {
		id: string;
		username: string;
		email: string;
	};
}

export interface MemberRequestsResponse {
	success: boolean;
	message?: string;
	data?: MemberRequest[];
}

export interface MemberRequestResponse {
	success: boolean;
	message?: string;
	data?: MemberRequest;
}

export interface HandleJoinRequestInput {
	status: "PENDING" | "ACCEPTED" | "REJECTED";
	storeId: string;
}

export const memberRequestsService = {
	getPendingMemberRequests: async (
		token: string | undefined,
	): Promise<MemberRequestsResponse> => {
		const response = await clientApiClient.post<{
			data: { getPendingMemberRequests: MemberRequestsResponse };
		}>(API_ENDPOINTS.graphql, token, {
			query: GET_PENDING_MEMBER_REQUESTS.loc?.source.body,
		});
		return response.data.getPendingMemberRequests;
	},

	getAllMemberRequests: async (
		token: string | undefined,
	): Promise<MemberRequestsResponse> => {
		const response = await clientApiClient.post<{
			data: { getAllMemberRequests: MemberRequestsResponse };
		}>(API_ENDPOINTS.graphql, token, {
			query: GET_ALL_MEMBER_REQUESTS.loc?.source.body,
		});
		return response.data.getAllMemberRequests;
	},

	getUserJoinRequest: async (
		token: string | undefined,
	): Promise<MemberRequestResponse> => {
		const response = await clientApiClient.post<{
			data: { getUserJoinRequest: MemberRequestResponse };
		}>(API_ENDPOINTS.graphql, token, {
			query: GET_USER_JOIN_REQUEST.loc?.source.body,
		});
		return response.data.getUserJoinRequest;
	},

	createJoinRequest: async (
		token: string | undefined,
	): Promise<MemberRequestResponse> => {
		const response = await clientApiClient.post<{
			data: { createJoinRequest: MemberRequestResponse };
		}>(API_ENDPOINTS.graphql, token, {
			query: CREATE_JOIN_REQUEST.loc?.source.body,
		});
		return response.data.createJoinRequest;
	},

	handleJoinRequest: async (
		requestId: string,
		input: HandleJoinRequestInput,
		token: string | undefined,
	): Promise<MemberRequestResponse> => {
		const response = await clientApiClient.post<{
			data: { handleJoinRequest: MemberRequestResponse };
		}>(API_ENDPOINTS.graphql, token, {
			query: HANDLE_JOIN_REQUEST.loc?.source.body,
			variables: { requestId, input },
		});
		return response.data.handleJoinRequest;
	},

	cancelJoinRequest: async (
		token: string | undefined,
	): Promise<MemberRequestResponse> => {
		const response = await clientApiClient.post<{
			data: { cancelJoinRequest: MemberRequestResponse };
		}>(API_ENDPOINTS.graphql, token, {
			query: CANCEL_JOIN_REQUEST.loc?.source.body,
		});
		return response.data.cancelJoinRequest;
	},
};
