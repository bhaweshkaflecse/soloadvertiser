import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role, JwtPayload } from '@solo-advertiser/types';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ERROR_CODES } from '@solo-advertiser/contracts';

/**
 * Role-based access control guard.
 * Checks if the authenticated user has one of the required roles.
 * Must be used after AuthGuard so that request.user is populated.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are specified, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: JwtPayload = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: ERROR_CODES.AUTH.FORBIDDEN,
        message: 'Insufficient permissions',
      });
    }

    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      throw new ForbiddenException({
        code: ERROR_CODES.AUTH.FORBIDDEN,
        message: 'Insufficient permissions for this action',
      });
    }

    return true;
  }
}
