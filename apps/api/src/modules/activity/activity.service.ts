import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, type ActivityState, type ActivityCategory } from '@prisma/client';
import type { CreateActivityDto } from './dto/create-activity.dto';
import type { UpdateActivityDto } from './dto/update-activity.dto';
import type { LifecycleDto } from './dto/lifecycle.dto';
import type { ActivityQueryDto } from './dto/activity-query.dto';

const CATEGORY_MAP: Record<string, string> = {
  '共学': 'CO_LEARNING',
  '精读': 'READING',
  '分享': 'SHARING',
  '训练': 'TRAINING',
  '线下': 'OFFLINE',
  '共建': 'CO_BUILDING',
  '投稿': 'SUBMISSION',
};

const PUBLIC_STATES = ['PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'ENDED'];

const ALLOWED_TRANSITIONS: Record<string, Record<string, string>> = {
  openRegistration: { PUBLISHED: 'REGISTRATION_OPEN' },
  start: { REGISTRATION_OPEN: 'IN_PROGRESS' },
  end: { IN_PROGRESS: 'ENDED' },
  cancel: { DRAFT: 'CANCELLED', PENDING_REVIEW: 'CANCELLED', REJECTED: 'CANCELLED', PUBLISHED: 'CANCELLED', REGISTRATION_OPEN: 'CANCELLED', IN_PROGRESS: 'CANCELLED' },
};

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: ActivityQueryDto) {
    const { page = 1, pageSize = 20, category, state, keyword, sort } = query;

    const where: Prisma.ActivityWhereInput = { deletedAt: null };

    if (state) {
      where.state = state as ActivityState;
    } else {
      where.state = { in: PUBLIC_STATES as ActivityState[] };
    }

    if (category) {
      const mapped = CATEGORY_MAP[category] ?? category;
      where.category = mapped as ActivityCategory;
    }

    if (keyword) {
      where.title = { contains: keyword, mode: 'insensitive' };
    }

    const orderBy = sort === 'hot'
      ? [{ approvedCount: 'desc' as const }, { createdAt: 'desc' as const }]
      : [{ createdAt: 'desc' as const }];

    const [items, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          category: true,
          summary: true,
          location: true,
          coverImageUrl: true,
          state: true,
          maxParticipants: true,
          approvedCount: true,
          startTime: true,
          endTime: true,
          registrationDeadline: true,
          publishedAt: true,
          createdAt: true,
          launcher: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { registrations: true } },
        },
      }),
      this.prisma.activity.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
      include: {
        launcher: { select: { id: true, name: true, avatarUrl: true } },
        minLevel: true,
        _count: { select: { registrations: true } },
      },
    });

    if (!activity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '活动不存在' });
    }

    return activity;
  }

  async create(userId: string, dto: CreateActivityDto) {
    const category = dto.category ? (CATEGORY_MAP[dto.category] ?? dto.category) : 'CO_LEARNING';

    const data: Prisma.ActivityCreateInput = {
      launcher: { connect: { id: userId } },
      title: dto.title,
      summary: dto.summary,
      location: dto.location,
      maxParticipants: dto.maxParticipants,
      state: 'DRAFT',
      category: category as ActivityCategory,
      content: dto.content,
      coverImageUrl: dto.coverImageUrl,
      minLevel: dto.minLevelId ? { connect: { id: dto.minLevelId } } : undefined,
      startTime: dto.startTime ? new Date(dto.startTime) : undefined,
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
    };

    return this.prisma.activity.create({ data });
  }

  async update(id: string, dto: UpdateActivityDto) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
    });

    if (!activity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '活动不存在' });
    }

    if (activity.state !== 'DRAFT' && activity.state !== 'REJECTED') {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '当前状态不可编辑' });
    }

    const data: Record<string, unknown> = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.summary !== undefined) data.summary = dto.summary;
    if (dto.location !== undefined) data.location = dto.location;
    if (dto.maxParticipants !== undefined) data.maxParticipants = dto.maxParticipants;
    if (dto.category !== undefined) data.category = CATEGORY_MAP[dto.category] ?? dto.category;
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.coverImageUrl !== undefined) data.coverImageUrl = dto.coverImageUrl;
    if (dto.minLevelId !== undefined) data.minLevelId = dto.minLevelId;
    if (dto.startTime) data.startTime = new Date(dto.startTime);
    if (dto.endTime) data.endTime = new Date(dto.endTime);
    if (dto.registrationDeadline) data.registrationDeadline = new Date(dto.registrationDeadline);

    return this.prisma.activity.update({ where: { id }, data });
  }

  async submitReview(id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
    });

    if (!activity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '活动不存在' });
    }

    if (activity.state !== 'DRAFT' && activity.state !== 'REJECTED') {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '当前状态不可提交审核' });
    }

    // Full strict validation (BR-AC-02)
    if (!activity.title || activity.title.length < 1 || activity.title.length > 100) {
      throw new BadRequestException({ code: 'VALIDATION', message: '标题长度需为1-100字' });
    }
    if (!activity.summary || activity.summary.length < 1 || activity.summary.length > 200) {
      throw new BadRequestException({ code: 'VALIDATION', message: '摘要长度需为1-200字' });
    }
    if (!activity.location || activity.location.length > 200) {
      throw new BadRequestException({ code: 'VALIDATION', message: '地点长度不超过200字' });
    }
    if (activity.maxParticipants < 1 || activity.maxParticipants > 10000) {
      throw new BadRequestException({ code: 'VALIDATION', message: '参与人数需为1-10000' });
    }
    if (!activity.startTime || !activity.endTime) {
      throw new BadRequestException({ code: 'VALIDATION', message: '请设置开始和结束时间' });
    }
    if (activity.startTime >= activity.endTime) {
      throw new BadRequestException({ code: 'VALIDATION', message: '结束时间必须晚于开始时间' });
    }
    if (activity.registrationDeadline && activity.registrationDeadline >= activity.startTime) {
      throw new BadRequestException({ code: 'VALIDATION', message: '报名截止时间必须早于开始时间' });
    }

    return this.prisma.activity.update({
      where: { id },
      data: { state: 'PENDING_REVIEW' },
    });
  }

  async lifecycle(id: string, dto: LifecycleDto) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
    });

    if (!activity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '活动不存在' });
    }

    const transitions = ALLOWED_TRANSITIONS[dto.action];
    if (!transitions || !transitions[activity.state]) {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '当前状态不可执行此操作' });
    }

    const newState = transitions[activity.state];
    const updateData: Record<string, unknown> = { state: newState };

    if (dto.action === 'end') {
      // Points issuance hook — deferred to Phase 4
      // TODO: Award ACTIVITY_JOIN (+120 growth) and ACTIVITY_JOIN_E (+50 exchange) to APPROVED registrants
      // TODO: Award ACTIVITY_LAUNCH (+300 growth) to launcher
    }

    return this.prisma.activity.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, deletedAt: null },
    });

    if (!activity) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '活动不存在' });
    }

    if (activity.state !== 'DRAFT') {
      throw new ConflictException({ code: 'INVALID_STATE_TRANSITION', message: '只有草稿可以删除' });
    }

    await this.prisma.activity.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
