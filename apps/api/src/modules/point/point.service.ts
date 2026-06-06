import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { TransactionQueryDto } from './dto/transaction-query.dto';

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
  async getTransactions(_userId: string, _query: TransactionQueryDto) { throw new Error('Not implemented'); }
  async dailyCheckIn(_userId: string) { throw new Error('Not implemented'); }
}
