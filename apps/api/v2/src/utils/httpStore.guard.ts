import {
	type ExecutionContext,
	Injectable,
	CanActivate,
	ForbiddenException,
	BadRequestException,
} from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

/**
 * HTTP Guard to validate user's store membership
 * Expects x-store-id header
 */
@Injectable()
export class HttpStoreGuard implements CanActivate {
	constructor(private prisma: DatabaseService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const storeId = request.headers["x-store-id"] as string;
		const user = request.user;

		if (!user || !user.id) {
			throw new ForbiddenException("User is not authenticated");
		}

		if (!storeId) {
			throw new BadRequestException("x-store-id header is missing");
		}

		const storeMember = await this.prisma.storeMember.findUnique({
			where: {
				storeId_userId: {
					userId: user.id,
					storeId: storeId as string,
				},
			},
		});

		if (!storeMember || !storeMember.isActive) {
			throw new ForbiddenException(
				"You do not have active access to this store",
			);
		}

		// Attach store info to request for controller use
		request.storeMember = storeMember;
		request.storeId = storeId;
		return true;
	}
}
