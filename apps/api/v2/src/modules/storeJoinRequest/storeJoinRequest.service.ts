import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
	ConflictException,
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import { HandleJoinRequestInput } from "./dto/storeJoinRequest.input";
import {
	StoreJoinRequestResponse,
	StoreJoinRequestsResponse,
} from "./entities/storeJoinRequest.entity";

@Injectable()
export class StoreJoinRequestService {
	constructor(private readonly database: DatabaseService) {}

	/**
	 * Create a join request for a user to a store
	 */
	async createJoinRequest(
		storeId: string,
		userId: string,
	): Promise<StoreJoinRequestResponse> {
		const store = await this.database.prisma.store.findUnique({
			where: { id: storeId },
		});

		if (!store) {
			throw new NotFoundException(`Store with ID ${storeId} not found`);
		}

		// Check if user is already a member
		const existingMember = await this.database.prisma.storeMember.findUnique({
			where: { storeId_userId: { storeId, userId } },
		});

		if (existingMember) {
			throw new BadRequestException("User is already a member of this store");
		}

		// Check if there's an existing pending request
		const existingRequest =
			await this.database.prisma.storeJoinRequest.findUnique({
				where: { storeId_userId: { storeId, userId } },
			});

		if (existingRequest) {
			if (existingRequest.status === "PENDING") {
				throw new BadRequestException(
					"You already have a pending join request for this store",
				);
			}
			// If rejected, allow re-apply by updating the request
			const updatedRequest = await this.database.prisma.storeJoinRequest.update(
				{
					where: { storeId_userId: { storeId, userId } },
					data: { status: "PENDING" },
					include: {
						user: true,
						store: true,
					},
				},
			);

			return {
				success: true,
				message: "Join request resubmitted successfully",
				data: updatedRequest as any,
			};
		}

		// Create new join request
		const joinRequest = await this.database.prisma.storeJoinRequest.create({
			data: {
				storeId,
				userId,
				status: "PENDING",
			},
			include: {
				user: true,
				store: true,
			},
		});

		return {
			success: true,
			message: "Join request submitted successfully",
			data: joinRequest as any,
		};
	}

	/**
	 * Get all pending join requests for a store (for admins)
	 */
	async getPendingJoinRequests(
		storeId: string,
	): Promise<StoreJoinRequestsResponse> {
		const joinRequests = await this.database.prisma.storeJoinRequest.findMany({
			where: {
				storeId,
				status: "PENDING",
			},
			include: {
				user: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			success: true,
			message: "Pending join requests fetched successfully",
			data: joinRequests as any,
		};
	}

	/**
	 * Get all join requests for a store (for admins)
	 */
	async getAllJoinRequests(
		storeId: string,
	): Promise<StoreJoinRequestsResponse> {
		const joinRequests = await this.database.prisma.storeJoinRequest.findMany({
			where: {
				storeId,
			},
			include: {
				user: true,
			},
			orderBy: {
				createdAt: "desc",
			},
		});

		return {
			success: true,
			message: "Join requests fetched successfully",
			data: joinRequests as any,
		};
	}

	async handleJoinRequest(
		requestId: string,
		input: HandleJoinRequestInput,
		requesterId: string,
	): Promise<StoreJoinRequestResponse> {
		const store = await this.database.prisma.store.findUnique({
			where: { id: input.storeId },
		});

		if (!store) {
			throw new NotFoundException(`Store with ID ${input.storeId} not found`);
		}

		// Verify requester is the store creator (only creator can approve/reject)
		if (store.creatorId !== requesterId) {
			throw new ForbiddenException(
				"Only the store creator can handle join requests",
			);
		}

		const joinRequest = await this.database.prisma.storeJoinRequest.findUnique({
			where: { id: requestId },
			include: {
				user: true,
			},
		});

		if (!joinRequest) {
			throw new NotFoundException("Join request not found");
		}

		if (joinRequest.storeId !== input.storeId) {
			throw new BadRequestException(
				"Join request does not belong to this store",
			);
		}

		if (joinRequest.status !== "PENDING") {
			throw new BadRequestException("Join request has already been processed");
		}

		// Update the request status
		const updatedRequest = await this.database.prisma.storeJoinRequest.update({
			where: { id: requestId },
			data: { status: input.status },
			include: {
				user: true,
			},
		});

		// If accepted, create a store member
		if (input.status === "ACCEPTED") {
			await this.database.prisma.storeMember.create({
				data: {
					storeId: input.storeId,
					userId: joinRequest.userId,
					role: "CASHIER", // Default role for accepted members
				},
			});
		}

		return {
			success: true,
			message:
				input.status === "ACCEPTED"
					? "Join request accepted. User added as a member."
					: "Join request rejected",
			data: updatedRequest as any,
		};
	}

	/**
	 * Get user's join request status for a specific store
	 */
	async getUserJoinRequest(
		storeId: string,
		userId: string,
	): Promise<StoreJoinRequestResponse> {
		const joinRequest = await this.database.prisma.storeJoinRequest.findUnique({
			where: { storeId_userId: { storeId, userId } },
			include: {
				user: true,
				store: true,
			},
		});

		if (!joinRequest) {
			return {
				success: true,
				message: "No join request found",
				data: undefined,
			};
		}

		return {
			success: true,
			message: "Join request fetched successfully",
			data: joinRequest as any,
		};
	}

	/**
	 * Cancel a pending join request (by the requester)
	 */
	async cancelJoinRequest(
		storeId: string,
		userId: string,
	): Promise<StoreJoinRequestResponse> {
		const joinRequest = await this.database.prisma.storeJoinRequest.findUnique({
			where: { storeId_userId: { storeId, userId } },
		});

		if (!joinRequest) {
			throw new NotFoundException("No join request found");
		}

		if (joinRequest.status !== "PENDING") {
			throw new BadRequestException("Cannot cancel a processed join request");
		}

		if (joinRequest.userId !== userId) {
			throw new ForbiddenException("You can only cancel your own join request");
		}

		await this.database.prisma.storeJoinRequest.delete({
			where: { id: joinRequest.id },
		});

		return {
			success: true,
			message: "Join request cancelled successfully",
		};
	}
}
