import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PointService } from '../point/point.service';
import type { AdjustPointsDto } from './dto/adjust-points.dto';
import type { UpdateStatusDto } from './dto/update-status.dto';
import type { AdminReviewDto } from './dto/review.dto';
import type { ActivityState, RewardCategory } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private pointService: PointService,
  ) {}

  async dashboard() { throw new Error('Not implemented'); }
  async findMembers(_query: Record<string, string>) { throw new Error('Not implemented'); }
  async findMember(_id: string) { throw new Error('Not implemented'); }
  async updateMemberStatus(_id: string, _dto: UpdateStatusDto) { throw new Error('Not implemented'); }

  async adjustPoints(dto: AdjustPointsDto, adminId: string) {
    return this.pointService.award({
      userId: dto.memberId,
      pointsType: dto.pointsType as 'GROWTH' | 'EXCHANGE',
      amount: dto.amount,
      ruleCode: 'ADMIN_ADJUST',
      title: '管理员手动调整',
      operatorId: adminId,
      reason: dto.reason,
    });
  }

  async findPointTransactions(query: Record<string, string>) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);

    const where: Record<string, unknown> = {};
    if (query.userId) where.userId = query.userId;
    if (query.pointsType) where.pointsType = query.pointsType;

    const [items, total] = await Promise.all([
      this.prisma.pointLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, memberNo: true } },
          rule: { select: { code: true, description: true } },
        },
      }),
      this.prisma.pointLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findPointRules() {
    return this.prisma.pointRule.findMany({ orderBy: { code: 'asc' } });
  }

  async updatePointRule(code: string, dto: Record<string, unknown>) {
    const rule = await this.prisma.pointRule.findUnique({
      where: { code },
    });

    if (!rule) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '积分规则不存在' });
    }

    const data: Record<string, unknown> = {};
    if (dto.enabled !== undefined) data.enabled = dto.enabled;
    if (dto.amount !== undefined) data.amount = dto.amount;

    return this.prisma.pointRule.update({
      where: { code },
      data,
    });
  }

  async findRewards(query: Record<string, string>) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);

    const where: Record<string, unknown> = {};
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.reward.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.reward.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async createReward(dto: Record<string, unknown>) {
    if (!dto.title || typeof dto.title !== 'string' || dto.title.length > 100) {
      throw new BadRequestException({ code: 'VALIDATION', message: '标题长度不超过100字' });
    }
    if (typeof dto.cost !== 'number' || dto.cost < 1) {
      throw new BadRequestException({ code: 'VALIDATION', message: '兑换积分需大于0' });
    }
    if (typeof dto.stock !== 'number' || dto.stock < 0) {
      throw new BadRequestException({ code: 'VALIDATION', message: '库存不能为负数' });
    }

    return this.prisma.reward.create({
      data: {
        title: dto.title as string,
        description: (dto.description as string) ?? null,
        imageUrl: (dto.imageUrl as string) ?? null,
        category: ((dto.category as string) ?? 'TOOL') as RewardCategory,
        cost: dto.cost as number,
        stock: dto.stock as number,
        status: 'ON_SHELF',
      },
    });
  }

  async updateReward(id: string, dto: Record<string, unknown>) {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '福利不存在' });
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.imageUrl !== undefined) data.imageUrl = dto.imageUrl;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.cost !== undefined) data.cost = dto.cost;
    if (dto.stock !== undefined) data.stock = dto.stock;

    return this.prisma.reward.update({ where: { id }, data });
  }

  async updateRewardStatus(id: string, dto: UpdateStatusDto) {
    const reward = await this.prisma.reward.findUnique({ where: { id } });
    if (!reward) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '福利不存在' });
    }

    if (dto.status !== 'ON_SHELF' && dto.status !== 'OFF_SHELF') {
      throw new BadRequestException({ code: 'VALIDATION', message: '状态值无效' });
    }

    return this.prisma.reward.update({
      where: { id },
      data: { status: dto.status },
    });
  }
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
