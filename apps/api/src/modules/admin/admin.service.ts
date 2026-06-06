import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AdjustPointsDto } from './dto/adjust-points.dto';
import type { UpdateStatusDto } from './dto/update-status.dto';
import type { AdminReviewDto } from './dto/review.dto';
import type { ActivityState } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async dashboard() { throw new Error('Not implemented'); }
  async findMembers(_query: Record<string, string>) { throw new Error('Not implemented'); }
  async findMember(_id: string) { throw new Error('Not implemented'); }
  async updateMemberStatus(_id: string, _dto: UpdateStatusDto) { throw new Error('Not implemented'); }
  async adjustPoints(_dto: AdjustPointsDto) { throw new Error('Not implemented'); }
  async findPointTransactions(_query: Record<string, string>) { throw new Error('Not implemented'); }
  async findPointRules() { throw new Error('Not implemented'); }
  async updatePointRule(_code: string, _dto: Record<string, unknown>) { throw new Error('Not implemented'); }
  async findRewards() { throw new Error('Not implemented'); }
  async createReward(_dto: Record<string, unknown>) { throw new Error('Not implemented'); }
  async updateReward(_id: string, _dto: Record<string, unknown>) { throw new Error('Not implemented'); }
  async updateRewardStatus(_id: string, _dto: UpdateStatusDto) { throw new Error('Not implemented'); }
  async findLevels() { throw new Error('Not implemented'); }
  async updateLevel(_id: string, _dto: Record<string, unknown>) { throw new Error('Not implemented'); }
  async findActivitiesForReview(query: Record<string, string>) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);

    const where = {
      state: { in: ['PENDING_REVIEW', 'PUBLISHED', 'REJECTED'] as ActivityState[] },
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          launcher: { select: { id: true, name: true, memberNo: true } },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async reviewActivity(id: string, dto: AdminReviewDto, adminId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
    });

    if (!activity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '活动不存在' });
    }

    if (activity.state !== 'PENDING_REVIEW') {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '只有待审核的活动可以审批' });
    }

    if (dto.approved) {
      return this.prisma.activity.update({
        where: { id },
        data: {
          state: 'PUBLISHED',
          publishedAt: new Date(),
          reviewedBy: adminId,
          rejectReason: null,
        },
      });
    }

    // Reject
    if (!dto.rejectReason) {
      throw new BadRequestException({ code: 'VALIDATION', message: '请填写拒绝原因' });
    }

    return this.prisma.activity.update({
      where: { id },
      data: {
        state: 'REJECTED',
        rejectReason: dto.rejectReason,
        reviewedBy: adminId,
      },
    });
  }
  async findLauncherApplications(_query: Record<string, string>) { throw new Error('Not implemented'); }
  async reviewLauncherApplication(_id: string, _dto: AdminReviewDto) { throw new Error('Not implemented'); }
}
