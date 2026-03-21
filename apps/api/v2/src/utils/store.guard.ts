import {
    type ExecutionContext,
    Injectable,
    CanActivate,
    ForbiddenException,
    BadRequestException
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class StoreGuard implements CanActivate {
    constructor(private prisma: DatabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        const req = ctx.getContext().req;

        if (!req) return false;

        const storeId = req.headers['x-store-id'];
        const user = req.user;

        if (!user || !user.id) {
            throw new ForbiddenException('User is not authenticated');
        }

        if (!storeId) {
            throw new BadRequestException('x-store-id header is missing');
        }

        const storeMember = await this.prisma.storeMember.findUnique({
            where: {
                storeId_userId: {
                    userId: user.id,
                    storeId: storeId as string
                }
            }
        });
        if (!storeMember || !storeMember.isActive) {
            throw new ForbiddenException('You do not have active access to this store');
        }

        req.storeMember = storeMember;
        req.storeId = storeId;
        return true;
    }
}
