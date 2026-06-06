import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        memberNo: true,
        name: true,
        avatarUrl: true,
        gender: true,
        birthday: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        levelId: true,
        growthPoints: true,
        exchangePoints: true,
        participationDays: true,
        streakDays: true,
        profileCompleted: true,
        profilePromptSkipped: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        level: {
          select: { id: true, name: true, minGrowthPoints: true, privileges: true, canApplyLauncher: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '用户不存在' });
    }

    const maskedPhone = user.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

    return {
      ...user,
      phone: maskedPhone,
    };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    if (dto.birthday) {
      const birthday = new Date(dto.birthday);
      if (isNaN(birthday.getTime())) {
        throw new BadRequestException({ code: 'VALIDATION', message: '生日格式无效' });
      }
      if (birthday > new Date()) {
        throw new BadRequestException({ code: 'VALIDATION', message: '生日不能晚于今天' });
      }
    }

    const currentUser = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileCompleted: true,
        name: true,
        gender: true,
        birthday: true,
        growthPoints: true,
      },
    });

    if (!currentUser) {
      throw new NotFoundException({ code: 'NOT_FOUND', message: '用户不存在' });
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.gender !== undefined) updateData.gender = dto.gender;
    if (dto.birthday !== undefined) updateData.birthday = new Date(dto.birthday);
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.avatarUrl !== undefined) updateData.avatarUrl = dto.avatarUrl;

    let shouldAwardPoints = false;
    if (!currentUser.profileCompleted) {
      const updatedName = (updateData.name as string) ?? currentUser.name;
      const updatedGender = (updateData.gender as string) ?? currentUser.gender;
      const updatedBirthday = updateData.birthday ?? currentUser.birthday;

      const isNowComplete =
        updatedName &&
        updatedName.trim().length > 0 &&
        updatedGender &&
        updatedGender !== 'UNKNOWN' &&
        updatedBirthday != null;

      if (isNowComplete) {
        updateData.profileCompleted = true;
        shouldAwardPoints = true;
      }
    }

    if (shouldAwardPoints) {
      await this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: updateData,
        });

        const newGrowthPoints = currentUser.growthPoints + 5;
        await tx.user.update({
          where: { id: userId },
          data: { growthPoints: newGrowthPoints },
        });

        await tx.pointLog.create({
          data: {
            userId,
            pointsType: 'GROWTH',
            amount: 5,
            balanceAfter: newGrowthPoints,
            ruleCode: 'PROFILE_COMPLETE',
            title: '首次完善个人资料',
          },
        });
      });
    } else {
      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });
    }

    return this.getMe(userId);
  }

  async deactivate(userId: string) {
    const deactivateAt = new Date();
    deactivateAt.setDate(deactivateAt.getDate() + 30);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'DEACTIVATING',
        deactivateAt,
      },
    });

    return { deactivateAt };
  }
}
