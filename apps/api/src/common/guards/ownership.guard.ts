import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { OWNERSHIP_KEY } from '../decorators/ownership.decorator';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<string>(OWNERSHIP_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!resource) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;
    if (!user || !resourceId) throw new ForbiddenException('FORBIDDEN');

    // Ownership check will be implemented per-resource in Phase 1+
    // For now, skeleton returns true
    return true;
  }
}
