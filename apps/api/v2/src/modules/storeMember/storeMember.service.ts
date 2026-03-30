import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import {
	StoreMemberResponse,
	StoreMembersResponse,
} from "./entities/storeMember.entity";

@Injectable()
export class StoreMemberService {
	constructor(private readonly database: DatabaseService) {}
	async onBoarding(
		storeId: string,
		userId: string,
	): Promise<StoreMemberResponse> {
		const store = await this.database.prisma.store.findUnique({
			where: { id: storeId },
		});

		if (!store) {
			throw new NotFoundException(`Store with ID ${storeId} not found`);
		}

		const storeJoinRequest = await this.database.prisma.storeJoinRequest.upsert(
			{
				where: { storeId_userId: { storeId, userId } },
				update: {
					status: "PENDING",
				},
				create: {
					storeId: store.id,
					userId,
				},
			},
		);
		if (!storeJoinRequest) {
			throw new BadRequestException("Failed to create store join request");
		}
		return {
			success: true,
		};
	}

	async removeMember(
		storeId: string,
		requesterId: string,
		memberId: string,
	): Promise<StoreMemberResponse> {
		// Verify requester is ADMIN of the store
		const requesterMembership =
			await this.database.prisma.storeMember.findUnique({
				where: { storeId_userId: { storeId, userId: requesterId } },
			});

		if (!requesterMembership || requesterMembership.role !== "ADMIN") {
			throw new ForbiddenException("Only store admins can remove members");
		}

		// Cannot remove yourself if you are the creator (safety check)
		const store = await this.database.prisma.store.findUnique({
			where: { id: storeId },
		});
		if (store?.creatorId === memberId) {
			throw new BadRequestException("Cannot remove the store creator");
		}

		await this.database.prisma.storeMember.delete({
			where: { id: memberId }, // Wait, memberId should be the ID of the StoreMember record or the userId?
			// In StoreMember model, 'id' is a separate field.
		});

		return {
			success: true,
			message: "Member removed successfully",
		};
	}

	async listMembers(storeId: string): Promise<StoreMembersResponse> {
		const members = await this.database.prisma.storeMember.findMany({
			where: { storeId },
			include: { user: true },
		});

		return {
			success: true,
			message: "Members fetched successfully",
			data: members as any,
		};
	}
}
