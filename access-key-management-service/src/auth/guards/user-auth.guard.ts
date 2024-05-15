import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { getUserOrNot } from 'src/utils/request-store';

export const JWT_AUTH_GUARD = 'JWT_AUTH_GUARD';
export const JwtAuthGuard = () => SetMetadata(JWT_AUTH_GUARD, true);

@Injectable()
export class UserAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isAuthCheck = this.hasAuthCheck(context);
    if (!isAuthCheck) return true;

    const user = getUserOrNot();
    if (!user) throw new UnauthorizedException();
    if (!user.isAdmin) throw new UnauthorizedException();

    return true;
  }

  hasAuthCheck(context: ExecutionContext) {
    return (
      this.reflector.get(JWT_AUTH_GUARD, context.getHandler()) ||
      this.reflector.get(JWT_AUTH_GUARD, context.getClass())
    );
  }
}
