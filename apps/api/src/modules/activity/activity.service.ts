import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateActivityDto } from './dto/create-activity.dto';
import type { UpdateActivityDto } from './dto/update-activity.dto';
import type { LifecycleDto } from './dto/lifecycle.dto';
import type { ActivityQueryDto } from './dto/activity-query.dto';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async findAll(_query: ActivityQueryDto) { throw new Error('Not implemented'); }
  async findOne(_id: string) { throw new Error('Not implemented'); }
  async create(_userId: string, _dto: CreateActivityDto) { throw new Error('Not implemented'); }
  async update(_id: string, _dto: UpdateActivityDto) { throw new Error('Not implemented'); }
  async submitReview(_id: string) { throw new Error('Not implemented'); }
  async lifecycle(_id: string, _dto: LifecycleDto) { throw new Error('Not implemented'); }
  async remove(_id: string) { throw new Error('Not implemented'); }
}
