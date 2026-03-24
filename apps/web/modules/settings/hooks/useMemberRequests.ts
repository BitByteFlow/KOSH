import { useMutation, useQuery } from "@apollo/client/react";
import {
	memberRequestsService,
	GET_PENDING_MEMBER_REQUESTS,
	GET_ALL_MEMBER_REQUESTS,
	GET_USER_JOIN_REQUEST,
	CREATE_JOIN_REQUEST,
	HANDLE_JOIN_REQUEST,
	CANCEL_JOIN_REQUEST,
	type MemberRequestsResponse,
	type MemberRequestResponse,
	type HandleJoinRequestInput,
} from "@/services/memberRequests.service";
import { toast } from "sonner";
import { getUserFriendlyErrorMessage } from "@/lib/api/errors";

export function usePendingMemberRequests() {
	return useQuery<{ getPendingJoinRequests: MemberRequestsResponse }>(
		GET_PENDING_MEMBER_REQUESTS,
		{
			fetchPolicy: "cache-and-network",
		},
	);
}

export function useAllMemberRequests() {
	return useQuery<{ getAllJoinRequests: MemberRequestsResponse }>(
		GET_ALL_MEMBER_REQUESTS,
		{
			fetchPolicy: "cache-and-network",
		},
	);
}

export function useUserJoinRequest() {
	return useQuery<{ getUserJoinRequest: MemberRequestResponse }>(
		GET_USER_JOIN_REQUEST,
		{
			fetchPolicy: "cache-and-network",
		},
	);
}

export function useCreateJoinRequest() {
	const [mutate, { loading }] = useMutation<{
		createJoinRequest: MemberRequestResponse;
	}>(CREATE_JOIN_REQUEST, {
		onCompleted: (data) => {
			if (data.createJoinRequest.success) {
				toast.success(
					data.createJoinRequest.message ||
						"Join request submitted successfully!",
				);
			} else {
				toast.error(
					data.createJoinRequest.message || "Failed to submit join request",
				);
			}
		},
		onError: (error) => {
			console.error("[useCreateJoinRequest] Error:", error);
			const message = getUserFriendlyErrorMessage(error);
			toast.error(message || "Failed to submit join request");
		},
		refetchQueries: [GET_PENDING_MEMBER_REQUESTS, GET_USER_JOIN_REQUEST],
	});

	return {
		mutate: () => mutate(),
		loading,
	};
}

export function useHandleJoinRequest() {
	const [mutate, { loading }] = useMutation<
		{
			handleJoinRequest: MemberRequestResponse;
		},
		{
			requestId: string;
			input: HandleJoinRequestInput;
		}
	>(HANDLE_JOIN_REQUEST, {
		onCompleted: (data) => {
			if (data.handleJoinRequest.success) {
				toast.success(
					data.handleJoinRequest.message || "Request handled successfully!",
				);
			} else {
				toast.error(
					data.handleJoinRequest.message || "Failed to handle request",
				);
			}
		},
		onError: (error) => {
			console.error("[useHandleJoinRequest] Error:", error);
			const message = getUserFriendlyErrorMessage(error);
			toast.error(message || "Failed to handle request");
		},
		refetchQueries: [GET_PENDING_MEMBER_REQUESTS, GET_ALL_MEMBER_REQUESTS],
	});

	return {
		mutate: (requestId: string, input: HandleJoinRequestInput) =>
			mutate({ variables: { requestId, input } }),
		loading,
	};
}

export function useCancelJoinRequest() {
	const [mutate, { loading }] = useMutation<{
		cancelJoinRequest: MemberRequestResponse;
	}>(CANCEL_JOIN_REQUEST, {
		onCompleted: (data) => {
			if (data.cancelJoinRequest.success) {
				toast.success(
					data.cancelJoinRequest.message || "Request cancelled successfully!",
				);
			} else {
				toast.error(
					data.cancelJoinRequest.message || "Failed to cancel request",
				);
			}
		},
		onError: (error) => {
			console.error("[useCancelJoinRequest] Error:", error);
			const message = getUserFriendlyErrorMessage(error);
			toast.error(message || "Failed to cancel request");
		},
		refetchQueries: [GET_USER_JOIN_REQUEST],
	});

	return {
		mutate: () => mutate(),
		loading,
	};
}
