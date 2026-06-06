import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AdjustPointsDto } from './dto/adjust-points.dto';
import type { UpdateStatusDto } from './dto/update-status.dto';
import type { AdminReviewDto } from './dto/review.dto';

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
  async findActivitiesForReview(_query: Record<string, string>) { throw new Error('Not implemented'); }
  async reviewActivity(_id: string, _dto: AdminReviewDto) { throw new Error('Not implemented'); }
  async findLauncherApplications(_query: Record<string, string>) { throw new Error('Not implemented'); }
  async reviewLauncherApplication(_id: string, _dto: AdminReviewDto) { throw new Error('Not implemented'); }
}
