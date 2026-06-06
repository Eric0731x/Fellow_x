import { Injectable, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { ApplyDto } from './dto/apply.dto';

@Injectable()
export class LauncherService {
  constructor(private prisma: PrismaService) {}

  async apply(userId: string, dto: ApplyDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { role: true, level: { select: { canApplyLauncher: true } } },
    });

    if (user.role !== 'MEMBER') {
      throw new ForbiddenException({ code: 'ALREADY_LAUNCHER', message: '您已是发起人' });
    }

    if (!user.level.canApplyLauncher) {
      throw new ForbiddenException({ code: 'LEVEL_NOT_QUALIFIED', message: '当前等级不满足发起人申请条件' });
    }

    const pending = await this.prisma.launcherApplication.findFirst({
      where: { userId, status: 'PENDING' },
    });
    if (pending) {
      throw new ConflictException({ code: 'APPLICATION_PENDING', message: '已有待审核的申请' });
    }

    return this.prisma.launcherApplication.create({
      data: { userId, description: dto.description },
    });
  }

  async findMyApplication(userId: string) {
    return this.prisma.launcherApplication.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
