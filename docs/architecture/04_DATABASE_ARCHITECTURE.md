# FellowX Database Architecture

> Engine: PostgreSQL 14+
> ORM: Prisma 5
> Convention: Tables snake_case plural, fields snake_case, UUID PKs, timestamptz UTC
> Source of truth: `specs/DATABASE_SCHEMA.md`

---

## 1. Entity-Relationship Overview

```
User 1───* Registration *───1 Activity
User 1───* PointLog
User 1───* RewardOrder *───1 Reward
User 1───0..1 LauncherApplication (active)
User *───* Badge (via UserBadge)
User *───1 Level (level_id FK)
Activity *───1 User (launcher_id)
PointRule 1───* PointLog (rule_code, weak FK)
User 1───* Notification
Admin ops → PointLog / AuditLog
```

**13 tables total**: `users`, `levels`, `launcher_applications`, `activities`, `registrations`, `point_rules`, `point_logs`, `rewards`, `reward_orders`, `notifications`, `badges`, `user_badges`, `audit_logs`

---

## 2. Table Specifications

### 2.1 users (会员)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | uuid | PK, gen_random_uuid() | |
| member_no | varchar(16) | UNIQUE, NOT NULL | Format: `FX-000000` |
| phone | varchar(20) | UNIQUE, NOT NULL | Login credential, display masked |
| password_hash | varchar(255) | NOT NULL | bcrypt |
| name | varchar(50) | NOT NULL | Nickname |
| avatar_url | varchar(512) | NULL | Fallback: first char + level color |
| gender | enum(GENDER) | NOT NULL, default UNKNOWN | MALE / FEMALE / UNKNOWN |
| birthday | date | NULL | Must be ≤ today |
| email | varchar(120) | NULL | Optional, format validated |
| role | enum(USER_ROLE) | NOT NULL, default MEMBER | MEMBER / LAUNCHER / ADMIN |
| status | enum(USER_STATUS) | NOT NULL, default ACTIVE | ACTIVE / SUSPENDED / DEACTIVATING / DELETED |
| level_id | smallint | FK→levels.id, NOT NULL | Denormalized cache |
| growth_points | int | NOT NULL, default 0, CHECK ≥0 | Growth track |
| exchange_points | int | NOT NULL, default 0, CHECK ≥0 | Exchange track |
| participation_days | int | NOT NULL, default 0 | |
| streak_days | int | NOT NULL, default 0 | |
| profile_completed | boolean | NOT NULL, default false | |
| profile_prompt_skipped | boolean | NOT NULL, default false | |
| deactivate_at | timestamptz | NULL | 30-day grace period |
| last_login_at | timestamptz | NULL | |
| created_at | timestamptz | NOT NULL, default now() | |
| updated_at | timestamptz | NOT NULL | |
| deleted_at | timestamptz | NULL | Soft delete |

**Indexes**: `phone`, `member_no`, `(role, status)`, `level_id`, trigram on `name`

### 2.2 levels (等级配置)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | smallint | PK | 1–5 (= level_order) |
| name | varchar(20) | NOT NULL | 萌新/同行者/实践家/布道者/核心 |
| min_growth_points | int | NOT NULL, UNIQUE | 0/500/1500/4000/9000 |
| privileges | text | NULL | Description |
| can_apply_launcher | boolean | NOT NULL, default false | True from L2+ |

**Design**: Admin-configurable thresholds. Changes do NOT retroactively downgrade existing users (BR-LV-03).

### 2.3 activities (活动)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | uuid | PK | |
| launcher_id | uuid | FK→users.id, NOT NULL | Owner |
| title | varchar(100) | NOT NULL | |
| category | enum | NOT NULL | 共学/精读/分享/训练/线下/共建/投稿 |
| summary | varchar(200) | NOT NULL | List card display |
| content | text | NULL | Rich text (HTML, stripped ≥20 chars) |
| location | varchar(200) | NOT NULL | |
| cover_image_url | varchar(512) | NULL | 16:9 |
| state | enum(ACTIVITY_STATE) | NOT NULL, default DRAFT | |
| min_level_id | smallint | FK→levels.id, NULL | NULL = no restriction |
| max_participants | int | NOT NULL, CHECK 1–10000 | |
| approved_count | int | NOT NULL, default 0 | Denormalized for optimistic lock |
| start_time | timestamptz | NULL | |
| end_time | timestamptz | NULL | Must be > start_time |
| registration_deadline | timestamptz | NULL | Must be < start_time |
| reject_reason | varchar(500) | NULL | |
| reviewed_by | uuid | FK→users.id, NULL | |
| published_at | timestamptz | NULL | |

**Indexes**: `state`, `launcher_id`, `category`, `registration_deadline`, `(state, start_time)`

### 2.4 registrations (报名)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | uuid | PK | |
| activity_id | uuid | FK→activities.id, NOT NULL | |
| user_id | uuid | FK→users.id, NOT NULL | |
| state | enum(REG_STATE) | NOT NULL, default PENDING | PENDING/APPROVED/REJECTED/CANCELLED |
| contact | varchar(100) | NULL | |
| note | varchar(500) | NULL | |
| reject_reason | varchar(500) | NULL | |
| reviewed_by | uuid | FK→users.id, NULL | |
| reviewed_at | timestamptz | NULL | |
| cancelled_at | timestamptz | NULL | |

**Unique constraint**: `UNIQUE (activity_id, user_id) WHERE state IN ('PENDING', 'APPROVED')`

### 2.5 point_rules (积分规则)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| code | varchar(40) | PK | Business key: ACTIVITY_JOIN, etc. |
| description | varchar(120) | NOT NULL | |
| points_type | enum | NOT NULL | GROWTH / EXCHANGE / BOTH |
| amount | int | NULL | NULL for ADMIN_ADJUST (variable) |
| enabled | boolean | NOT NULL, default true | |
| is_system | boolean | NOT NULL, default true | Cannot delete |

**Seed data**: 6 built-in rules (ACTIVITY_JOIN, ACTIVITY_JOIN_E, ACTIVITY_LAUNCH, CANCEL_APPROVED, DAILY_LOGIN, ADMIN_ADJUST)

### 2.6 point_logs (积分流水)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL | |
| points_type | enum | NOT NULL | GROWTH / EXCHANGE |
| amount | int | NOT NULL | Positive = add, negative = deduct |
| balance_after | int | NOT NULL | Snapshot for reconciliation |
| rule_code | varchar(40) | FK→point_rules.code, NULL | |
| title | varchar(160) | NOT NULL | Display text |
| ref_type | varchar(40) | NULL | activity / reward / admin |
| ref_id | uuid | NULL | |
| operator_id | uuid | FK→users.id, NULL | Admin adjustment |
| reason | varchar(500) | NULL | Admin adjustment reason |
| created_at | timestamptz | NOT NULL | |

**Indexes**: `(user_id, created_at DESC)`, `points_type`, `(ref_type, ref_id)`

**Critical**: Append-only ledger. Never update or delete.

### 2.7 rewards (福利)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | uuid | PK | |
| title | varchar(100) | NOT NULL | |
| description | text | NULL | |
| image_url | varchar(512) | NULL | 1:1 |
| category | enum | NOT NULL | 工具/周边/服务/会员特权 |
| cost | int | NOT NULL, CHECK ≥0 | Exchange points required |
| stock | int | NOT NULL, CHECK ≥0 | |
| redeemed_count | int | NOT NULL, default 0 | |
| status | enum | NOT NULL, default ON_SHELF | ON_SHELF / OFF_SHELF |

### 2.8 reward_orders (兑换订单)

| Field | Type | Constraint | Notes |
|-------|------|-----------|-------|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL | |
| reward_id | uuid | FK→rewards.id, NOT NULL | |
| cost | int | NOT NULL | Snapshot at order time |
| state | enum | NOT NULL, default FULFILLED | PENDING/FULFILLED/CANCELLED — virtual rewards default FULFILLED directly |
| point_log_id | uuid | FK→point_logs.id, NULL | |
| fulfillment_note | varchar(500) | NULL | |

### 2.9 Other Tables

- **launcher_applications**: User application to become Launcher. Partial unique on `(user_id) WHERE status = 'PENDING'`.
- **notifications**: User notifications with type enum, ref_type/ref_id, is_read flag.
- **badges**: Badge definitions with condition_type (COUNT/STREAK/LEVEL/MANUAL) and threshold.
- **user_badges**: Composite PK `(user_id, badge_id)` with earned_at timestamp.
- **audit_logs**: Admin action log with operator_id, action, target, payload (jsonb), ip.

---

## 3. Enum Definitions

```prisma
enum UserRole { MEMBER LAUNCHER ADMIN }
enum UserStatus { ACTIVE SUSPENDED DEACTIVATING DELETED }
enum Gender { MALE FEMALE UNKNOWN }
enum ActivityState { DRAFT PENDING_REVIEW PUBLISHED REGISTRATION_OPEN IN_PROGRESS ENDED REJECTED CANCELLED }
enum RegistrationState { PENDING APPROVED REJECTED CANCELLED }
enum ApplicationStatus { PENDING APPROVED REJECTED }
enum PointsType { GROWTH EXCHANGE BOTH }
enum RewardStatus { ON_SHELF OFF_SHELF }
enum OrderState { PENDING FULFILLED CANCELLED }
enum NotificationType { ACTIVITY_REVIEW LAUNCHER_REVIEW REGISTRATION_REVIEW ACTIVITY_CANCELLED POINTS SYSTEM }
```

---

## 4. Transaction Boundaries (Consistency Red Lines)

### 4.1 Points Change

```
BEGIN
  → INSERT point_log
  → UPDATE users (balance)
  → UPDATE point_log (balance_after snapshot)
  → IF growth changed: UPDATE users.level_id
  → (optional) INSERT notification
COMMIT
```

### 4.2 Registration Approval (Optimistic Lock)

```
BEGIN
  → UPDATE activities SET approved_count = approved_count + 1
    WHERE id = ? AND approved_count < max_participants
  → IF affected_rows = 0: ROLLBACK + throw ACTIVITY_FULL
  → UPDATE registrations SET state = 'APPROVED'
COMMIT
```

### 4.3 Activity End → Points Issuance

```
BEGIN
  → For each APPROVED registration:
    → Award ACTIVITY_JOIN (+120 growth)
    → Award ACTIVITY_JOIN_E (+50 exchange)
  → Award launcher ACTIVITY_LAUNCH (+300 growth)
  → All idempotent by activity_id
COMMIT
```

### 4.4 Reward Redemption

```
BEGIN
  → UPDATE users SET exchange_points = exchange_points - cost
    WHERE id = ? AND exchange_points >= cost
  → IF affected_rows = 0: ROLLBACK + throw INSUFFICIENT_POINTS
  → UPDATE rewards SET stock = stock - 1, redeemed_count = redeemed_count + 1
    WHERE id = ? AND stock > 0
  → IF affected_rows = 0: ROLLBACK + throw OUT_OF_STOCK
  → INSERT reward_order
  → INSERT point_log (balance_after snapshot)
COMMIT
```

---

## 5. Seed Data Strategy

Phase 0 seed script creates:

| Entity | Count | Details |
|--------|-------|---------|
| levels | 5 | 萌新(0), 同行者(500), 实践家(1500), 布道者(4000), 核心(9000) |
| point_rules | 6 | Built-in rules with default amounts |
| admin user | 1 | Pre-seeded admin account |
| sample rewards | 4 | Diverse categories for testing |

---

## 6. Design Rationale: Denormalized Fields

| Field | Table | Why |
|-------|-------|-----|
| `growth_points` / `exchange_points` | users | Read-heavy (level check, top bar). Write in same transaction as point_log. |
| `level_id` | users | Avoid `WHERE min_growth_points <= ? ORDER BY min_growth_points DESC LIMIT 1` on every read. |
| `approved_count` | activities | Avoid `COUNT(*) WHERE state='APPROVED'` under concurrent approval. Use optimistic lock. |
| `balance_after` | point_logs | Snapshot for reconciliation without summing entire history. |
| `cost` | reward_orders | Snapshot at order time; reward price changes don't affect history. |
