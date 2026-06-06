import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { RewardQueryDto } from './dto/reward-query.dto';

@Injectable()
export class RewardService {
  constructor(private prisma: PrismaService) {}

  async findAll(_query: RewardQueryDto) { throw new Error('Not implemented'); }
  async redeem(_userId: string, _rewardId: string) { throw new Error('Not implemented'); }
  async findMyOrders(_userId: string, _query: RewardQueryDto) { throw new Error('Not implemented'); }
}
