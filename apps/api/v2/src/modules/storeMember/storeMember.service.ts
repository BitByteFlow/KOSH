import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
// import { AddMemberInput, UpdateMemberRoleInput } from "./dto/storeMember.input";
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

	// async addMember(storeId: string, userId: string, input: AddMemberInput): Promise<StoreMemberResponse> {
	//   // Verify requester is ADMIN of the store
	//   const requesterMembership = await this.database.prisma.storeMember.findUnique({
	//     where: { storeId_userId: { storeId, userId } },
	//   });

	//   if (!requesterMembership || requesterMembership.role !== "ADMIN") {
	//     throw new ForbiddenException("Only store admins can add members");
	//   }

	//   // Find user by email
	//   const userToAdd = await this.database.prisma.user.findUnique({
	//     where: { email: input.email },
	//   });

	//   if (!userToAdd) {
	//     throw new NotFoundException(`User with email ${input.email} not found`);
	//   }

	//   // Check if already a member
	//   const existingMembership = await this.database.prisma.storeMember.findUnique({
	//     where: { storeId_userId: { storeId, userId: userToAdd.id } },
	//   });

	//   if (existingMembership) {
	//     throw new BadRequestException("User is already a member of this store");
	//   }

	//   const membership = await this.database.prisma.storeMember.create({
	//     data: {
	//       storeId,
	//       userId: userToAdd.id,
	//       role: input.role,
	//     },
	//     include: { user: true },
	//   });

	//   return {
	//     success: true,
	//     message: "Member added successfully",
	//     data: membership as any,
	//   };
	// }

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

	// async updateMemberRole(
	//   storeId: string,
	//   requesterId: string,
	//   membershipId: string,
	//   input: UpdateMemberRoleInput
	// ): Promise<StoreMemberResponse> {
	//   // Verify requester is ADMIN
	//   const requesterMembership = await this.database.prisma.storeMember.findUnique({
	//     where: { storeId_userId: { storeId, userId: requesterId } },
	//   });

	//   if (!requesterMembership || requesterMembership.role !== "ADMIN") {
	//     throw new ForbiddenException("Only store admins can update member roles");
	//   }

	//   const updatedMembership = await this.database.prisma.storeMember.update({
	//     where: { id: membershipId },
	//     data: { role: input.role },
	//     include: { user: true },
	//   });

	//   return {
	//     success: true,
	//     message: "Member role updated successfully",
	//     data: updatedMembership as any,
	//   };
	// }

	// async listMembers(storeId: string): Promise<StoreMembersResponse> {
	//   const members = await this.database.prisma.storeMember.findMany({
	//     where: { storeId },
	//     include: { user: true },
	//   });

	//   return {
	//     success: true,
	//     message: "Members fetched successfully",
	//     data: members as any,
	//   };
	// }
}
