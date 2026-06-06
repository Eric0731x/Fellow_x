import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, type PointsType } from '@prisma/client';
import type { TransactionQueryDto } from './dto/transaction-query.dto';

interface AwardParams {
  userId: string;
  pointsType: PointsType;
  amount: number;
  ruleCode: string;
  title: string;
  refType?: string;
  refId?: string;
  operatorId?: string;
  reason?: string;
}

@Injectable()
export class PointService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { level: true },
    });

    const nextLevel = await this.prisma.level.findFirst({
      where: { minGrowthPoints: { gt: user.growthPoints } },
      orderBy: { minGrowthPoints: 'asc' },
    });

    const currentMin = user.level.minGrowthPoints;
    const nextMin = nextLevel?.minGrowthPoints ?? currentMin;
    const range = nextMin - currentMin;
    const progress = range > 0
      ? Math.min(100, Math.round(((user.growthPoints - currentMin) / range) * 100))
      : 100;

    return {
      growthPoints: user.growthPoints,
      exchangePoints: user.exchangePoints,
      level: user.level,
      nextLevel,
      progress,
    };
  }

  async getTransactions(userId: string, query: TransactionQueryDto) {
    const { page = 1, pageSize = 20, pointsType } = query;

    const where: Record<string, unknown> = { userId };
    if (pointsType) where.pointsType = pointsType;

    const [items, total] = await Promise.all([
      this.prisma.pointLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          rule: { select: { code: true, description: true } },
        },
      }),
      this.prisma.pointLog.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async dailyCheckIn(userId: string) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const existing = await this.prisma.pointLog.findFirst({
      where: {
        userId,
        ruleCode: 'DAILY_LOGIN',
        createdAt: { gte: startOfToday },
      },
    });

    if (existing) {
      throw new ConflictException({ code: 'ALREADY_CHECKED_IN', message: '今日已签到' });
    }

    const rule = await this.prisma.pointRule.findUnique({
      where: { code: 'DAILY_LOGIN' },
    });

    if (!rule || !rule.enabled) {
      throw new ConflictException({ code: 'RULE_DISABLED', message: '签到功能暂不可用' });
    }

    return this.award({
      userId,
      pointsType: 'EXCHANGE',
      amount: rule.amount ?? 10,
      ruleCode: 'DAILY_LOGIN',
      title: '每日签到',
    });
  }

  async award(params: AwardParams) {
    const { userId, pointsType, amount, ruleCode, title, refType, refId, operatorId, reason } = params;

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { growthPoints: true, exchangePoints: true, levelId: true },
      });

      const currentBalance = pointsType === 'GROWTH' ? user.growthPoints : user.exchangePoints;
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        throw new BadRequestException({ code: 'BALANCE_INSUFFICIENT', message: '积分不足' });
      }

      await tx.pointLog.create({
        data: {
          userId,
          pointsType,
          amount,
          balanceAfter: newBalance,
          ruleCode,
          title,
          refType: refType ?? null,
          refId: refId ?? null,
          operatorId: operatorId ?? null,
          reason: reason ?? null,
        },
      });

      if (pointsType === 'GROWTH') {
        await tx.user.update({
          where: { id: userId },
          data: { growthPoints: newBalance },
        });
        await this.recalcLevel(userId, newBalance, tx);
      } else {
        await tx.user.update({
          where: { id: userId },
          data: { exchangePoints: newBalance },
        });
      }

      return { newBalance };
    });
  }

  private async recalcLevel(userId: string, growthPoints: number, tx: Prisma.TransactionClient) {
    const bestLevel = await tx.level.findFirst({
      where: { minGrowthPoints: { lte: growthPoints } },
      orderBy: { minGrowthPoints: 'desc' },
      select: { id: true },
    });

    if (bestLevel) {
      await tx.user.update({
        where: { id: userId },
        data: { levelId: bestLevel.id },
      });
    }
  }
}
