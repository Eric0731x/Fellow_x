-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'LAUNCHER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DEACTIVATING', 'DELETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ActivityState" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'ENDED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegistrationState" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PointsType" AS ENUM ('GROWTH', 'EXCHANGE', 'BOTH');

-- CreateEnum
CREATE TYPE "RewardStatus" AS ENUM ('ON_SHELF', 'OFF_SHELF');

-- CreateEnum
CREATE TYPE "OrderState" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'FULFILLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ACTIVITY_REVIEW', 'LAUNCHER_REVIEW', 'REGISTRATION_REVIEW', 'ACTIVITY_CANCELLED', 'POINTS', 'SYSTEM');

-- CreateEnum
CREATE TYPE "ActivityCategory" AS ENUM ('共学', '精读', '分享', '训练', '线下', '共建', '投稿');

-- CreateEnum
CREATE TYPE "RewardCategory" AS ENUM ('工具', '周边', '服务', '会员特权');

-- CreateEnum
CREATE TYPE "BadgeConditionType" AS ENUM ('COUNT', 'STREAK', 'LEVEL', 'MANUAL');

-- CreateTable
CREATE TABLE "levels" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "min_growth_points" INTEGER NOT NULL,
    "privileges" TEXT,
    "can_apply_launcher" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "member_no" VARCHAR(16) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "avatar_url" VARCHAR(512),
    "gender" "Gender" NOT NULL DEFAULT 'UNKNOWN',
    "birthday" DATE,
    "email" VARCHAR(120),
    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "level_id" SMALLINT NOT NULL,
    "growth_points" INTEGER NOT NULL DEFAULT 0,
    "exchange_points" INTEGER NOT NULL DEFAULT 0,
    "participation_days" INTEGER NOT NULL DEFAULT 0,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "profile_completed" BOOLEAN NOT NULL DEFAULT false,
    "profile_prompt_skipped" BOOLEAN NOT NULL DEFAULT false,
    "deactivate_at" TIMESTAMPTZ,
    "last_login_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "launcher_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "reject_reason" VARCHAR(500),
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "launcher_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "launcher_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "category" "ActivityCategory" NOT NULL,
    "summary" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "location" VARCHAR(200) NOT NULL,
    "cover_image_url" VARCHAR(512),
    "state" "ActivityState" NOT NULL DEFAULT 'DRAFT',
    "min_level_id" SMALLINT,
    "max_participants" INTEGER NOT NULL,
    "approved_count" INTEGER NOT NULL DEFAULT 0,
    "start_time" TIMESTAMPTZ,
    "end_time" TIMESTAMPTZ,
    "registration_deadline" TIMESTAMPTZ,
    "reject_reason" VARCHAR(500),
    "reviewed_by" UUID,
    "published_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "activity_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "state" "RegistrationState" NOT NULL DEFAULT 'PENDING',
    "contact" VARCHAR(100),
    "note" VARCHAR(500),
    "reject_reason" VARCHAR(500),
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "cancelled_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_rules" (
    "code" VARCHAR(40) NOT NULL,
    "description" VARCHAR(120) NOT NULL,
    "points_type" "PointsType" NOT NULL,
    "amount" INTEGER,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_system" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "point_rules_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "point_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "points_type" "PointsType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "rule_code" VARCHAR(40),
    "title" VARCHAR(160) NOT NULL,
    "ref_type" VARCHAR(40),
    "ref_id" UUID,
    "operator_id" UUID,
    "reason" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rewards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(512),
    "category" "RewardCategory" NOT NULL,
    "cost" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "redeemed_count" INTEGER NOT NULL DEFAULT 0,
    "status" "RewardStatus" NOT NULL DEFAULT 'ON_SHELF',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "reward_id" UUID NOT NULL,
    "cost" INTEGER NOT NULL,
    "state" "OrderState" NOT NULL DEFAULT 'COMPLETED',
    "point_log_id" UUID,
    "fulfillment_note" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "reward_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "body" VARCHAR(500),
    "ref_type" VARCHAR(40),
    "ref_id" UUID,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(40) NOT NULL,
    "name" VARCHAR(40) NOT NULL,
    "icon" VARCHAR(16) NOT NULL,
    "hint" VARCHAR(120) NOT NULL,
    "condition_type" "BadgeConditionType" NOT NULL,
    "threshold" INTEGER,

    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_badges" (
    "user_id" UUID NOT NULL,
    "badge_id" UUID NOT NULL,
    "earned_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("user_id","badge_id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "operator_id" UUID NOT NULL,
    "action" VARCHAR(60) NOT NULL,
    "target_type" VARCHAR(40) NOT NULL,
    "target_id" UUID,
    "payload" JSONB,
    "ip" INET,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "levels_min_growth_points_key" ON "levels"("min_growth_points");

-- CreateIndex
CREATE UNIQUE INDEX "users_member_no_key" ON "users"("member_no");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_member_no_idx" ON "users"("member_no");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE INDEX "users_level_id_idx" ON "users"("level_id");

-- CreateIndex
CREATE INDEX "launcher_applications_user_id_idx" ON "launcher_applications"("user_id");

-- CreateIndex
CREATE INDEX "launcher_applications_status_idx" ON "launcher_applications"("status");

-- CreateIndex
CREATE INDEX "activities_state_idx" ON "activities"("state");

-- CreateIndex
CREATE INDEX "activities_launcher_id_idx" ON "activities"("launcher_id");

-- CreateIndex
CREATE INDEX "activities_category_idx" ON "activities"("category");

-- CreateIndex
CREATE INDEX "activities_registration_deadline_idx" ON "activities"("registration_deadline");

-- CreateIndex
CREATE INDEX "activities_state_start_time_idx" ON "activities"("state", "start_time");

-- CreateIndex
CREATE INDEX "registrations_activity_id_state_idx" ON "registrations"("activity_id", "state");

-- CreateIndex
CREATE INDEX "registrations_user_id_idx" ON "registrations"("user_id");

-- CreateIndex
CREATE INDEX "point_logs_user_id_idx" ON "point_logs"("user_id");

-- CreateIndex
CREATE INDEX "point_logs_points_type_idx" ON "point_logs"("points_type");

-- CreateIndex
CREATE INDEX "point_logs_ref_type_ref_id_idx" ON "point_logs"("ref_type", "ref_id");

-- CreateIndex
CREATE INDEX "rewards_status_category_idx" ON "rewards"("status", "category");

-- CreateIndex
CREATE INDEX "reward_orders_user_id_idx" ON "reward_orders"("user_id");

-- CreateIndex
CREATE INDEX "reward_orders_reward_id_idx" ON "reward_orders"("reward_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "badges_code_key" ON "badges"("code");

-- CreateIndex
CREATE INDEX "user_badges_user_id_idx" ON "user_badges"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_operator_id_created_at_idx" ON "audit_logs"("operator_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "audit_logs_target_type_target_id_idx" ON "audit_logs"("target_type", "target_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "launcher_applications" ADD CONSTRAINT "launcher_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "launcher_applications" ADD CONSTRAINT "launcher_applications_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_launcher_id_fkey" FOREIGN KEY ("launcher_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_min_level_id_fkey" FOREIGN KEY ("min_level_id") REFERENCES "levels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_logs" ADD CONSTRAINT "point_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_logs" ADD CONSTRAINT "point_logs_rule_code_fkey" FOREIGN KEY ("rule_code") REFERENCES "point_rules"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_logs" ADD CONSTRAINT "point_logs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_orders" ADD CONSTRAINT "reward_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reward_orders" ADD CONSTRAINT "reward_orders_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
