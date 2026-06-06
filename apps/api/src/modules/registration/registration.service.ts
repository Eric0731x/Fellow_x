import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { RegisterDto } from './dto/register.dto';
import type { ReviewDto } from './dto/review.dto';
import type { RegistrationQueryDto } from './dto/registration-query.dto';

@Injectable()
export class RegistrationService {
  constructor(private prisma: PrismaService) {}

  async register(userId: string, activityId: string, dto: RegisterDto) {
    const activity = await this.prisma.activity.findFirst({
      where: { id: activityId, deletedAt: null },
    });

    if (!activity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '活动不存在' });
    }

    // BR-RG-03: Activity must be REGISTRATION_OPEN
    if (activity.state !== 'REGISTRATION_OPEN') {
      throw new ConflictException({ code: 'REGISTRATION_CLOSED', message: '报名未开放' });
    }

    // BR-RG-03: Not past deadline
    if (activity.registrationDeadline && new Date() > activity.registrationDeadline) {
      throw new ConflictException({ code: 'DEADLINE_PASSED', message: '报名已截止' });
    }

    // BR-RG-03: Level check
    if (activity.minLevelId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { levelId: true, status: true },
      });
      if (!user || user.status !== 'ACTIVE') {
        throw new ForbiddenException({ code: 'FORBIDDEN', message: '账号状态异常' });
      }
      if (user.levelId < activity.minLevelId) {
        throw new ForbiddenException({ code: 'LEVEL_TOO_LOW', message: '等级不满足要求' });
      }
    }

    // BR-RG-01: No duplicate PENDING/APPROVED registration
    const existing = await this.prisma.registration.findFirst({
      where: {
        activityId,
        userId,
        state: { in: ['PENDING', 'APPROVED'] },
      },
    });
    if (existing) {
      throw new ConflictException({ code: 'DUPLICATE_REGISTRATION', message: '已报名该活动' });
    }

    return this.prisma.registration.create({
      data: {
        activityId,
        userId,
        state: 'PENDING',
        contact: dto.contact,
        note: dto.note,
      },
    });
  }

  async findMine(userId: string, query: RegistrationQueryDto) {
    const { page = 1, pageSize = 20, state } = query;

    const where: Record<string, unknown> = { userId };
    if (state) where.state = state;

    const [items, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          activity: {
            select: {
              id: true,
              title: true,
              category: true,
              summary: true,
              location: true,
              coverImageUrl: true,
              state: true,
              startTime: true,
              endTime: true,
              launcher: { select: { id: true, name: true, avatarUrl: true } },
            },
          },
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async cancel(userId: string, id: string) {
    const registration = await this.prisma.registration.findFirst({
      where: { id, userId },
    });

    if (!registration) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '报名记录不存在' });
    }

    if (registration.state === 'CANCELLED' || registration.state === 'REJECTED') {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '当前状态不可取消' });
    }

    if (registration.state === 'APPROVED') {
      // BR-RG-06: Release slot
      return this.prisma.$transaction(async (tx) => {
        const updated = await tx.registration.update({
          where: { id },
          data: { state: 'CANCELLED', cancelledAt: new Date() },
        });

        await tx.activity.update({
          where: { id: registration.activityId },
          data: { approvedCount: { decrement: 1 } },
        });

        return updated;
      });
    }

    // PENDING: simple cancel, no slot impact
    return this.prisma.registration.update({
      where: { id },
      data: { state: 'CANCELLED', cancelledAt: new Date() },
    });
  }

  async findByActivity(activityId: string, query: RegistrationQueryDto) {
    const { page = 1, pageSize = 20, state, keyword } = query;

    const where: Record<string, unknown> = { activityId };
    if (state) where.state = state;
    if (keyword) {
      where.user = {
        OR: [
          { name: { contains: keyword, mode: 'insensitive' } },
          { memberNo: { contains: keyword, mode: 'insensitive' } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.registration.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, memberNo: true } },
        },
      }),
      this.prisma.registration.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async review(id: string, dto: ReviewDto) {
    const registration = await this.prisma.registration.findFirst({
      where: { id },
      include: { activity: true },
    });

    if (!registration) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '报名记录不存在' });
    }

    if (registration.state !== 'PENDING') {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '只有待审核的报名可以审批' });
    }

    if (dto.approved) {
      // BR-RG-02: Optimistic lock — increment approved_count
      const result = await this.prisma.$transaction(async (tx) => {
        const updated = await tx.activity.updateMany({
          where: {
            id: registration.activityId,
            approvedCount: { lt: registration.activity.maxParticipants },
          },
          data: { approvedCount: { increment: 1 } },
        });

        if (updated.count === 0) {
          throw new ConflictException({ code: 'ACTIVITY_FULL', message: '活动名额已满' });
        }

        return tx.registration.update({
          where: { id },
          data: {
            state: 'APPROVED',
            reviewedAt: new Date(),
          },
        });
      });

      return result;
    }

    // Reject
    if (!dto.rejectReason) {
      throw new BadRequestException({ code: 'VALIDATION', message: '请填写拒绝原因' });
    }

    return this.prisma.registration.update({
      where: { id },
      data: {
        state: 'REJECTED',
        rejectReason: dto.rejectReason,
        reviewedAt: new Date(),
      },
    });
  }
}
