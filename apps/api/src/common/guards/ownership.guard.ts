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

    if (resource === 'activity') {
      const activity = await this.prisma.activity.findFirst({
        where: { id: resourceId, deletedAt: null },
        select: { launcherId: true },
      });
      if (!activity || activity.launcherId !== user.id) {
        throw new ForbiddenException({ code: 'FORBIDDEN', message: '无权操作此活动' });
      }
    }

    return true;
  }
}
