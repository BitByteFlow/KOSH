/* eslint-disable prettier/prettier */
import {
    ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any):any {
        // If token is invalid or expired
        // console.log(user)
        if (err || !user) {
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token expired. Please login again.');
            }
            if (info?.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid token.');
            }
            throw new UnauthorizedException('Please login to continue.');
        }

        // user now contains: { id, username, email }
        return user;
    }
}