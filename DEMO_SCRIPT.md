# FellowX - Demo Script

## Setup

Before the demo, ensure:
1. Docker PostgreSQL is running: `docker compose up -d`
2. Database is migrated and seeded: `npm run db:migrate -w apps/api && npm run db:seed -w apps/api`
3. Dev servers are running: `npm run dev`
4. Open http://localhost:5173

---

## Flow 1: Member Journey (张小明)

**Login**
1. Navigate to `/login`
2. Enter phone: `1390000001`, password: `member123`
3. Redirect to member home `/me`

**Browse Activities**
1. Click "活动" in navigation → `/activities`
2. See "RAG技术精读会" (REGISTRATION_OPEN state)
3. Click into activity detail → `/activities/:id`
4. Click "报名" → confirm dialog → registration submitted (PENDING)

**Daily Check-in**
1. Navigate to `/points`
2. Click "签到" button → +10 exchange points
3. See transaction in history table

**Browse & Redeem Rewards**
1. Navigate to `/rewards`
2. See reward cards with category tabs
3. Click "立即兑换" on a reward → confirm dialog → success
4. Navigate to `/orders` → see the order in history

**Apply as Launcher**
1. Navigate to `/me/launcher-apply`
2. Fill in application description → submit
3. See "审核中" status

---

## Flow 2: Launcher Journey (赵发起)

**Login**
1. Navigate to `/login`
2. Enter phone: `13900000010`, password: `launcher123`
3. Redirect to member home `/me`

**Create Activity**
1. Navigate to `/launcher/activities`
2. Click "新建活动" → `/launcher/activities/create`
3. Fill in: title, category, summary, location, max participants, times
4. Submit → activity created (DRAFT state)

**Submit for Review**
1. Back to `/launcher/activities`
2. Click "提交审核" on the draft activity
3. Activity state changes to PENDING_REVIEW

**Manage Registrations**
1. Navigate to `/launcher/activities/:id/registrations`
2. See registration list with PENDING/APPROVED/REJECTED states
3. Approve or reject individual registrations

---

## Flow 3: Admin Journey (系统管理员)

**Login**
1. Navigate to `/login`
2. Enter phone: `13800000000`, password: `admin123`
3. Redirect to admin dashboard `/admin/dashboard`

**Dashboard**
1. See stat cards: member count, launcher count, active activities
2. See monthly stats: points transactions, reward orders
3. See pending counts: activity reviews, launcher applications
4. See level distribution

**Review Launcher Application**
1. Navigate to `/admin/review` (or use launcher application list)
2. See 张小明's pending application
3. Click "通过" → user role upgrades to LAUNCHER
4. Notification sent to the user

**Review Activity**
1. See pending activity from launcher
2. Click "通过" → activity published, notification sent to launcher
3. Or click "拒绝" with reason → activity rejected, notification sent

**Member Management**
1. Navigate to `/admin/members`
2. See paginated member table with role/status filters
3. Click a member → detail page with full info
4. Suspend/unsuspend a member

**Level Management**
1. Navigate to `/admin/levels`
2. See all 5 levels with min growth points
3. Edit a level's name, privileges, or canApplyLauncher flag
4. Note: minGrowthPoints is not editable (business rule BR-LV-03)

**Reward Management**
1. Navigate to `/admin/rewards`
2. Create a new reward with title, category, cost, stock
3. Toggle reward on/off shelf status

**Points Management**
1. Navigate to `/admin/points/transactions`
2. See all point transaction logs (placeholder page — backend works)

---

## Key Business Rules to Highlight

1. **Transaction-safe points**: All point changes run in a single DB transaction with balanceAfter snapshot
2. **Atomic redemption**: Stock deduction + point deduction + order creation are all-or-nothing
3. **Idempotent activity end**: Points are issued once per user per activity, even if end is triggered twice
4. **Level never decreases**: Admin threshold changes do not retroactively downgrade users (BR-LV-03)
5. **State machines**: Activity (8 states), Registration (4 states), Launcher Application (3 states), User Status (4 states)
6. **Optimistic locking**: Activity registration uses `approved_count + 1 WHERE approved_count < max_participants`
