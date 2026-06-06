import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ─── Levels ───────────────────────────────────────────────────
  const levels = await Promise.all([
    prisma.level.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1, name: '萌新', minGrowthPoints: 0, privileges: '基础权限', canApplyLauncher: false },
    }),
    prisma.level.upsert({
      where: { id: 2 },
      update: {},
      create: { id: 2, name: '同行者', minGrowthPoints: 500, privileges: '可申请成为发起人', canApplyLauncher: true },
    }),
    prisma.level.upsert({
      where: { id: 3 },
      update: {},
      create: { id: 3, name: '实践家', minGrowthPoints: 1500, privileges: '优先报名权', canApplyLauncher: true },
    }),
    prisma.level.upsert({
      where: { id: 4 },
      update: {},
      create: { id: 4, name: '布道者', minGrowthPoints: 4000, privileges: '专属福利', canApplyLauncher: true },
    }),
    prisma.level.upsert({
      where: { id: 5 },
      update: {},
      create: { id: 5, name: '核心', minGrowthPoints: 9000, privileges: '核心圈层', canApplyLauncher: true },
    }),
  ]);
  console.log(`  Created ${levels.length} levels`);

  // ─── Point Rules ──────────────────────────────────────────────
  const pointRules = await Promise.all([
    prisma.pointRule.upsert({
      where: { code: 'ACTIVITY_JOIN' },
      update: {},
      create: { code: 'ACTIVITY_JOIN', description: '完成活动参与', pointsType: 'GROWTH', amount: 120, isSystem: true },
    }),
    prisma.pointRule.upsert({
      where: { code: 'ACTIVITY_JOIN_E' },
      update: {},
      create: { code: 'ACTIVITY_JOIN_E', description: '完成活动参与', pointsType: 'EXCHANGE', amount: 50, isSystem: true },
    }),
    prisma.pointRule.upsert({
      where: { code: 'ACTIVITY_LAUNCH' },
      update: {},
      create: { code: 'ACTIVITY_LAUNCH', description: '活动发起奖励', pointsType: 'GROWTH', amount: 300, isSystem: true },
    }),
    prisma.pointRule.upsert({
      where: { code: 'CANCEL_APPROVED' },
      update: {},
      create: { code: 'CANCEL_APPROVED', description: '取消已通过报名', pointsType: 'GROWTH', amount: -50, isSystem: true },
    }),
    prisma.pointRule.upsert({
      where: { code: 'DAILY_LOGIN' },
      update: {},
      create: { code: 'DAILY_LOGIN', description: '每日签到', pointsType: 'EXCHANGE', amount: 10, isSystem: true },
    }),
    prisma.pointRule.upsert({
      where: { code: 'ADMIN_ADJUST' },
      update: {},
      create: { code: 'ADMIN_ADJUST', description: '管理员手动调整', pointsType: 'BOTH', amount: null, isSystem: true },
    }),
    prisma.pointRule.upsert({
      where: { code: 'PROFILE_COMPLETE' },
      update: {},
      create: { code: 'PROFILE_COMPLETE', description: '首次完善个人资料', pointsType: 'GROWTH', amount: 5, isSystem: true },
    }),
  ]);
  console.log(`  Created ${pointRules.length} point rules`);

  // ─── Admin User ───────────────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '13800000000' },
    update: {},
    create: {
      memberNo: 'FX-000001',
      phone: '13800000000',
      passwordHash: adminPasswordHash,
      name: '系统管理员',
      role: 'ADMIN',
      status: 'ACTIVE',
      levelId: 5,
      growthPoints: 0,
      exchangePoints: 0,
      profileCompleted: true,
    },
  });
  console.log(`  Created admin: ${admin.name} (${admin.phone})`);

  // ─── Member Users ─────────────────────────────────────────────
  const memberPasswordHash = await bcrypt.hash('member123', 10);
  const members = await Promise.all([
    prisma.user.upsert({
      where: { phone: '13900000001' },
      update: {},
      create: {
        memberNo: 'FX-000002',
        phone: '13900000001',
        passwordHash: memberPasswordHash,
        name: '张小明',
        role: 'MEMBER',
        status: 'ACTIVE',
        levelId: 1,
        growthPoints: 0,
        exchangePoints: 0,
        profileCompleted: true,
      },
    }),
    prisma.user.upsert({
      where: { phone: '13900000002' },
      update: {},
      create: {
        memberNo: 'FX-000003',
        phone: '13900000002',
        passwordHash: memberPasswordHash,
        name: '李小红',
        role: 'MEMBER',
        status: 'ACTIVE',
        levelId: 2,
        growthPoints: 600,
        exchangePoints: 100,
        profileCompleted: true,
      },
    }),
    prisma.user.upsert({
      where: { phone: '13900000003' },
      update: {},
      create: {
        memberNo: 'FX-000004',
        phone: '13900000003',
        passwordHash: memberPasswordHash,
        name: '王大力',
        role: 'MEMBER',
        status: 'ACTIVE',
        levelId: 1,
        growthPoints: 0,
        exchangePoints: 50,
        profileCompleted: false,
      },
    },
    ),
  ]);
  console.log(`  Created ${members.length} members`);

  // ─── Launcher User ────────────────────────────────────────────
  const launcherPasswordHash = await bcrypt.hash('launcher123', 10);
  const launcher = await prisma.user.upsert({
    where: { phone: '13900000010' },
    update: {},
    create: {
      memberNo: 'FX-000005',
      phone: '13900000010',
      passwordHash: launcherPasswordHash,
      name: '赵发起',
      role: 'LAUNCHER',
      status: 'ACTIVE',
      levelId: 3,
      growthPoints: 2000,
      exchangePoints: 300,
      profileCompleted: true,
    },
  });
  console.log(`  Created launcher: ${launcher.name} (${launcher.phone})`);

  // ─── Rewards ──────────────────────────────────────────────────
  const rewards = await Promise.all([
    prisma.reward.create({
      data: {
        title: 'AI 提示词手册',
        description: '精选100个高效AI提示词模板',
        category: 'TOOL',
        cost: 200,
        stock: 50,
        status: 'ON_SHELF',
      },
    }),
    prisma.reward.create({
      data: {
        title: '社区定制T恤',
        description: ' FellowX 社区限量版T恤',
        category: 'MERCHANDISE',
        cost: 500,
        stock: 20,
        status: 'ON_SHELF',
      },
    }),
    prisma.reward.create({
      data: {
        title: '1v1 技术咨询',
        description: '30分钟技术方向咨询',
        category: 'SERVICE',
        cost: 800,
        stock: 10,
        status: 'ON_SHELF',
      },
    }),
    prisma.reward.create({
      data: {
        title: 'VIP 会员月卡',
        description: '一个月VIP会员特权',
        category: 'MEMBER_PRIVILEGE',
        cost: 300,
        stock: 100,
        status: 'ON_SHELF',
      },
    }),
    prisma.reward.create({
      data: {
        title: '社区定制马克杯',
        description: ' FellowX 社区限量版马克杯',
        category: 'MERCHANDISE',
        cost: 350,
        stock: 0,
        status: 'ON_SHELF',
      },
    }),
  ]);
  console.log(`  Created ${rewards.length} rewards`);

  // ─── Activities ───────────────────────────────────────────────
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in1Day = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  const activities = await Promise.all([
    prisma.activity.create({
      data: {
        launcherId: launcher.id,
        title: 'RAG 技术精读会',
        category: 'READING',
        summary: '深入解读RAG技术原理与实践',
        content: '<p>本次精读会将深入探讨RAG（检索增强生成）技术的核心原理、最佳实践和最新进展。</p>',
        location: '线上 Zoom',
        state: 'REGISTRATION_OPEN',
        minLevelId: 1,
        maxParticipants: 30,
        startTime: in7Days,
        endTime: new Date(in7Days.getTime() + 2 * 60 * 60 * 1000),
        registrationDeadline: in3Days,
        publishedAt: now,
      },
    }),
    prisma.activity.create({
      data: {
        launcherId: launcher.id,
        title: 'AI Agent 动手训练营',
        category: 'TRAINING',
        summary: '从零搭建你的第一个AI Agent',
        content: '<p>手把手带你搭建一个能使用工具的AI Agent。</p>',
        location: '线上腾讯会议',
        state: 'PUBLISHED',
        minLevelId: 2,
        maxParticipants: 20,
        startTime: in7Days,
        endTime: new Date(in7Days.getTime() + 3 * 60 * 60 * 1000),
        registrationDeadline: in3Days,
        publishedAt: now,
      },
    }),
    prisma.activity.create({
      data: {
        launcherId: launcher.id,
        title: 'Prompt Engineering 共学',
        category: 'CO_LEARNING',
        summary: '系统学习提示词工程',
        content: '<p>一起系统学习如何写好提示词。</p>',
        location: '线上',
        state: 'DRAFT',
        minLevelId: null,
        maxParticipants: 50,
      },
    },
    ),
  ]);
  console.log(`  Created ${activities.length} activities`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
