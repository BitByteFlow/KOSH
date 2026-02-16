import {
    type ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedUser } from '../types/jwt.types';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    getRequest(context: ExecutionContext) {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }

    handleRequest<TUser = AuthenticatedUser>(
        err: Error | null,
        user: TUser | null,
        info: { name?: string; message?: string } | undefined,
        context: ExecutionContext,
        status?: number
    ): TUser {
        if (err || !user) {
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token expired. Please login again.');
            }
            if (info?.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid token.');
            }
            throw new UnauthorizedException('Please login to continue.');
        }

        return user;
    }
}