import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PointService } from '../point/point.service';
import type { RewardQueryDto } from './dto/reward-query.dto';

@Injectable()
export class RewardService {
  constructor(
    private prisma: PrismaService,
    private pointService: PointService,
  ) {}

  async findAll(query: RewardQueryDto) {
    const { page = 1, pageSize = 20, category } = query;

    const where: Record<string, unknown> = { status: 'ON_SHELF' };
    if (category) where.category = category;

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

  async redeem(userId: string, rewardId: string) {
    // BR-RW-01: Verify user ACTIVE
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { status: true, exchangePoints: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new ForbiddenException({ code: 'FORBIDDEN', message: '账号状态异常' });
    }

    // BR-RW-01: Verify reward ON_SHELF
    const reward = await this.prisma.reward.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '福利不存在' });
    }

    if (reward.status !== 'ON_SHELF') {
      throw new ConflictException({ code: 'REWARD_OFF_SHELF', message: '福利已下架' });
    }

    // BR-RW-02: Single transaction — stock lock + point deduction + order creation
    return this.prisma.$transaction(async (tx) => {
      // Optimistic stock lock (BR-RW-01)
      const stockUpdate = await tx.reward.updateMany({
        where: { id: rewardId, stock: { gt: 0 } },
        data: { stock: { decrement: 1 }, redeemedCount: { increment: 1 } },
      });

      if (stockUpdate.count === 0) {
        throw new ConflictException({ code: 'REWARD_OUT_OF_STOCK', message: '福利已售罄' });
      }

      // BR-RW-01: Check exchange points sufficient
      const currentUser = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { exchangePoints: true },
      });

      const newBalance = currentUser.exchangePoints - reward.cost;
      if (newBalance < 0) {
        throw new BadRequestException({ code: 'BALANCE_INSUFFICIENT', message: '兑换积分不足' });
      }

      // Deduct exchange points + write point log (inline for atomicity)
      await tx.user.update({
        where: { id: userId },
        data: { exchangePoints: newBalance },
      });

      const pointLog = await tx.pointLog.create({
        data: {
          userId,
          pointsType: 'EXCHANGE',
          amount: -reward.cost,
          balanceAfter: newBalance,
          ruleCode: 'REDEEM',
          title: reward.title,
          refType: 'REWARD',
          refId: rewardId,
        },
      });

      // BR-RW-04: Snapshot cost into order
      const order = await tx.rewardOrder.create({
        data: {
          userId,
          rewardId,
          cost: reward.cost,
          state: 'COMPLETED',
          pointLogId: pointLog.id,
        },
      });

      return order;
    });
  }

  async findMyOrders(userId: string, query: RewardQueryDto) {
    const { page = 1, pageSize = 20, category } = query;

    const where: Record<string, unknown> = { userId };
    if (category) {
      where.reward = { category };
    }

    const [items, total] = await Promise.all([
      this.prisma.rewardOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          reward: {
            select: { id: true, title: true, imageUrl: true, category: true },
          },
        },
      }),
      this.prisma.rewardOrder.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }
}
