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

  async dashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      memberCount,
      launcherCount,
      activeActivityCount,
      monthlyPointsCount,
      monthlyRewardCount,
      pendingActivityReviews,
      pendingLauncherApps,
      levelDistribution,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'MEMBER', deletedAt: null } }),
      this.prisma.user.count({ where: { role: 'LAUNCHER', deletedAt: null } }),
      this.prisma.activity.count({
        where: { state: { in: ['REGISTRATION_OPEN', 'IN_PROGRESS'] as ActivityState[] }, deletedAt: null },
      }),
      this.prisma.pointLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.rewardOrder.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.activity.count({
        where: { state: 'PENDING_REVIEW' as ActivityState, deletedAt: null },
      }),
      this.prisma.launcherApplication.count({ where: { status: 'PENDING' } }),
      this.prisma.user.groupBy({
        by: ['levelId'],
        _count: true,
        where: { deletedAt: null },
      }),
    ]);

    const levels = await this.prisma.level.findMany({
      select: { id: true, name: true },
      orderBy: { id: 'asc' },
    });

    const levelDistributionWithNames = levelDistribution.map((ld) => {
      const level = levels.find((l) => l.id === ld.levelId);
      return { levelId: ld.levelId, name: level?.name ?? 'Unknown', count: ld._count };
    });

    return {
      memberCount,
      launcherCount,
      activeActivityCount,
      monthlyPointsCount,
      monthlyRewardCount,
      pendingActivityReviews,
      pendingLauncherApps,
      levelDistribution: levelDistributionWithNames,
    };
  }

  async findMembers(query: Record<string, string>) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);

    const where: Record<string, unknown> = { deletedAt: null };
    if (query.role) where.role = query.role;
    if (query.status) where.status = query.status;
    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword, mode: 'insensitive' } },
        { memberNo: { contains: query.keyword, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          name: true,
          memberNo: true,
          phone: true,
          role: true,
          status: true,
          growthPoints: true,
          exchangePoints: true,
          createdAt: true,
          level: { select: { id: true, name: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findMember(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        memberNo: true,
        phone: true,
        email: true,
        gender: true,
        birthday: true,
        avatarUrl: true,
        role: true,
        status: true,
        growthPoints: true,
        exchangePoints: true,
        participationDays: true,
        streakDays: true,
        createdAt: true,
        lastLoginAt: true,
        level: { select: { id: true, name: true } },
        _count: {
          select: {
            registrations: true,
            rewardOrders: true,
            pointLogs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '会员不存在' });
    }

    return user;
  }

  async updateMemberStatus(id: string, dto: UpdateStatusDto) {
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      select: { id: true, status: true },
    });

    if (!user) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '会员不存在' });
    }

    // STATE_MACHINE §5: admin can only toggle ACTIVE↔SUSPENDED
    if (dto.status !== 'ACTIVE' && dto.status !== 'SUSPENDED') {
      throw new BadRequestException({ code: 'VALIDATION', message: '管理员只能切换 ACTIVE/SUSPENDED 状态' });
    }

    if (user.status !== 'ACTIVE' && user.status !== 'SUSPENDED') {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '当前状态不允许该操作' });
    }

    return this.prisma.user.update({
      where: { id },
      data: { status: dto.status as 'ACTIVE' | 'SUSPENDED' },
      select: { id: true, name: true, status: true },
    });
  }

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

  async findLevels() {
    return this.prisma.level.findMany({ orderBy: { id: 'asc' } });
  }

  async updateLevel(id: string, dto: Record<string, unknown>) {
    const level = await this.prisma.level.findUnique({ where: { id: parseInt(id, 10) } });
    if (!level) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '等级不存在' });
    }

    // BR-LV-03: do not allow changing minGrowthPoints (no retroactive downgrade)
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.privileges !== undefined) data.privileges = dto.privileges;
    if (dto.canApplyLauncher !== undefined) data.canApplyLauncher = dto.canApplyLauncher;

    return this.prisma.level.update({
      where: { id: parseInt(id, 10) },
      data,
    });
  }

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
      const updated = await this.prisma.activity.update({
        where: { id },
        data: {
          state: 'PUBLISHED',
          publishedAt: new Date(),
          reviewedBy: adminId,
          rejectReason: null,
        },
      });
      await this.prisma.notification.create({
        data: {
          userId: activity.launcherId,
          type: 'ACTIVITY_REVIEW',
          title: '活动审核已通过',
          body: `您的活动「${activity.title}」已通过审核并发布`,
          refType: 'ACTIVITY',
          refId: id,
        },
      });
      return updated;
    }

    // Reject
    if (!dto.rejectReason) {
      throw new BadRequestException({ code: 'VALIDATION', message: '请填写拒绝原因' });
    }

    const updated = await this.prisma.activity.update({
      where: { id },
      data: {
        state: 'REJECTED',
        rejectReason: dto.rejectReason,
        reviewedBy: adminId,
      },
    });
    await this.prisma.notification.create({
      data: {
        userId: activity.launcherId,
        type: 'ACTIVITY_REVIEW',
        title: '活动审核未通过',
        body: dto.rejectReason,
        refType: 'ACTIVITY',
        refId: id,
      },
    });
    return updated;
  }

  async findLauncherApplications(query: Record<string, string>) {
    const page = parseInt(query.page ?? '1', 10);
    const pageSize = Math.min(parseInt(query.pageSize ?? '20', 10), 100);

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [items, total] = await Promise.all([
      this.prisma.launcherApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: { select: { id: true, name: true, memberNo: true, levelId: true } },
        },
      }),
      this.prisma.launcherApplication.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async reviewLauncherApplication(id: string, dto: AdminReviewDto, adminId: string) {
    const application = await this.prisma.launcherApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '申请不存在' });
    }

    if (application.status !== 'PENDING') {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '只有待审核的申请可以审批' });
    }

    if (dto.approved) {
      const [updatedApplication] = await this.prisma.$transaction([
        this.prisma.launcherApplication.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedBy: adminId,
            reviewedAt: new Date(),
          },
        }),
        this.prisma.user.update({
          where: { id: application.userId },
          data: { role: 'LAUNCHER' },
        }),
        this.prisma.notification.create({
          data: {
            userId: application.userId,
            type: 'LAUNCHER_REVIEW',
            title: '发起人申请已通过',
            body: '恭喜您，发起人申请已通过审核',
            refType: 'LAUNCHER_APPLICATION',
            refId: id,
          },
        }),
      ]);
      return updatedApplication;
    }

    // Reject
    if (!dto.rejectReason) {
      throw new BadRequestException({ code: 'VALIDATION', message: '请填写拒绝原因' });
    }

    const [updatedApplication] = await this.prisma.$transaction([
      this.prisma.launcherApplication.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectReason: dto.rejectReason,
          reviewedBy: adminId,
          reviewedAt: new Date(),
        },
      }),
      this.prisma.notification.create({
        data: {
          userId: application.userId,
          type: 'LAUNCHER_REVIEW',
          title: '发起人申请未通过',
          body: dto.rejectReason,
          refType: 'LAUNCHER_APPLICATION',
          refId: id,
        },
      }),
    ]);
    return updatedApplication;
  }
}
