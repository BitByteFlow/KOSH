import {
    type ExecutionContext,
    Injectable,
    UnauthorizedException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        console.log("im here in jwt guard")
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any):any {
        console.log("im here in jwt guard handle request")
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