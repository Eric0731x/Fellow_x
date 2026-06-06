import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { UserRole } from '@fellowx/shared';

// LAUNCHER inherits all MEMBER permissions; ADMIN is independent
const roleHierarchy: Record<UserRole, UserRole[]> = {
  ADMIN: ['ADMIN'],
  LAUNCHER: ['LAUNCHER', 'MEMBER'],
  MEMBER: ['MEMBER'],
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new ForbiddenException('FORBIDDEN');

    const userRoles = roleHierarchy[user.role as UserRole] || [];
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) throw new ForbiddenException('FORBIDDEN');

    return true;
  }
}
