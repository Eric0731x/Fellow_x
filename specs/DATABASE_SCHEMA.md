# DATABASE_SCHEMA.md · FellowX 数据库设计

> 数据库：PostgreSQL 14+ · 命名：表名 snake_case 复数，字段 snake_case
> 所有表默认含：`id`（主键）、`created_at`、`updated_at`、软删除 `deleted_at`（nullable）
> 金额/积分均为整数（无小数）；时间统一 `timestamptz`（UTC 存储，前端按本地展示）
> 本文件是 SDD 的数据契约源头，API_SPEC / STATE_MACHINE / BUSINESS_RULES 中的字段名以此为准。

---

## 0. ER 关系总览

```
User 1───* Registration *───1 Activity
User 1───* PointLog
User 1───* RewardOrder *───1 Reward
User 1───0..1 LauncherApplication (active)   // 同一时间最多 1 条 PENDING
User *───* Badge  (via user_badges)
User *──1 Level   (level_id, 冗余缓存当前等级)
Activity *──1 User (launcher_id)
PointRule 1───* PointLog (rule_code, 弱关联)
User 1───* Notification
Admin 操作 → PointLog / AuditLog 留痕
```

实体清单（11 张业务表 + 2 张关联/审计表）：
`users` · `levels` · `launcher_applications` · `activities` · `registrations` · `point_rules` · `point_logs` · `rewards` · `reward_orders` · `notifications` · `badges` · `user_badges` · `audit_logs`

---

## 1. users — 会员

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK, default gen_random_uuid() | 主键 |
| member_no | varchar(16) | UNIQUE, NOT NULL | 会员号 `FX-000000`，注册时生成 |
| phone | varchar(20) | UNIQUE, NOT NULL | 登录凭证，存明文/可加密；展示脱敏 |
| password_hash | varchar(255) | NOT NULL | bcrypt；若走短信验证码登录可空 |
| name | varchar(50) | NOT NULL | 昵称 |
| avatar_url | varchar(512) | NULL | 头像；空时前端用姓名首字 + 等级色 |
| gender | enum | NOT NULL default 'UNKNOWN' | `MALE` `FEMALE` `UNKNOWN` |
| birthday | date | NULL | 不晚于今天 |
| email | varchar(120) | NULL | 格式校验，唯一性可选 |
| role | enum | NOT NULL default 'MEMBER' | `MEMBER` `LAUNCHER` `ADMIN`（见注） |
| status | enum | NOT NULL default 'ACTIVE' | `ACTIVE` `SUSPENDED` `DEACTIVATING` `DELETED` |
| level_id | smallint | FK→levels.id, NOT NULL | 当前等级（冗余缓存，随成长分变更） |
| growth_points | int | NOT NULL default 0, CHECK ≥0 | 成长积分（只增） |
| exchange_points | int | NOT NULL default 0, CHECK ≥0 | 兑换积分（可消费） |
| participation_days | int | NOT NULL default 0 | 参与天数（统计字段） |
| streak_days | int | NOT NULL default 0 | 连续活跃天数 |
| profile_completed | boolean | NOT NULL default false | 是否完善过资料（控制引导弹窗） |
| profile_prompt_skipped | boolean | NOT NULL default false | 是否跳过完善引导 |
| deactivate_at | timestamptz | NULL | 注销生效时间（申请时 = now + 30d） |
| last_login_at | timestamptz | NULL | 末次登录 |

**索引**：`idx_users_phone(phone)`、`idx_users_member_no(member_no)`、`idx_users_role_status(role,status)`、`idx_users_level(level_id)`、全文/trigram `idx_users_name_trgm(name)` 便于后台搜索。

**设计理由**
- `role` 单值枚举而非多角色表：Launcher 是 Member 的超集，Admin 独立后台，业务上互斥，单枚举足够且查询简单；若未来需多角色再引入 `user_roles` 关联表。
- `growth_points` / `exchange_points` 冗余在 users 上（而非每次 SUM(point_logs)）：读多写少，等级判定与顶栏展示需高频读取；写入时在事务内同时更新冗余值与插入 `point_logs`，以 `point_logs` 为审计真相。
- `level_id` 冗余缓存：避免每次按 growth_points 区间查询；积分变更后在同一事务内重算。

---

## 2. levels — 等级配置（管理员可配）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | smallint | PK | 等级序号 1..5（= level_order） |
| name | varchar(20) | NOT NULL | 萌新 / 同行者 / 实践家 / 布道者 / 核心 |
| min_growth_points | int | NOT NULL, UNIQUE | 晋级最低成长分：0/500/1500/4000/9000 |
| privileges | text | NULL | 特权描述 |
| can_apply_launcher | boolean | NOT NULL default false | 是否可申请发起人（同行者起 true） |

**索引**：`idx_levels_min_points(min_growth_points)`。

**设计理由**：等级少（5 条）且需管理员后台配置阈值，独立成表。修改阈值**不回溯降级**存量会员（见 BUSINESS_RULES BR-LV-03）——因此 `users.level_id` 不随 levels 变更自动重算，仅新积分事件触发重算。

---

## 3. launcher_applications — 发起人申请

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL | 申请人 |
| description | varchar(500) | NOT NULL | 个人简介 |
| status | enum | NOT NULL default 'PENDING' | `PENDING` `APPROVED` `REJECTED` |
| reject_reason | varchar(500) | NULL | 驳回原因 |
| reviewed_by | uuid | FK→users.id, NULL | 审核管理员 |
| reviewed_at | timestamptz | NULL | 审核时间 |

**索引**：`idx_la_user(user_id)`、`idx_la_status(status)`。
**唯一约束**：partial unique `uniq_la_active ON (user_id) WHERE status='PENDING'` —— 保证同一用户同时只有 1 条待审核（BR-AP-01）。

---

## 4. activities — 活动

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| launcher_id | uuid | FK→users.id, NOT NULL | 发起人 |
| title | varchar(100) | NOT NULL | 标题 |
| category | enum | NOT NULL | `共学` `精读` `分享` `训练` `线下` `共建` `投稿` |
| summary | varchar(200) | NOT NULL | 摘要（列表卡展示，= description） |
| content | text | NULL | 富文本详情（HTML，去标签 ≥20 字） |
| location | varchar(200) | NOT NULL | 地点（线上/线下文本） |
| cover_image_url | varchar(512) | NULL | 封面 16:9 |
| state | enum | NOT NULL default 'DRAFT' | 见 STATE_MACHINE |
| min_level_id | smallint | FK→levels.id, NULL | 报名最低等级，NULL=无限制 |
| max_participants | int | NOT NULL, CHECK 1..10000 | 名额 |
| approved_count | int | NOT NULL default 0 | 已通过人数（冗余，防超额并发） |
| start_time | timestamptz | NULL | 开始（草稿可空） |
| end_time | timestamptz | NULL | 结束，> start_time |
| registration_deadline | timestamptz | NULL | 报名截止，< start_time |
| reject_reason | varchar(500) | NULL | 审核驳回原因 |
| reviewed_by | uuid | FK→users.id, NULL | 审核人 |
| published_at | timestamptz | NULL | 审核通过时间 |

**索引**：`idx_act_state(state)`、`idx_act_launcher(launcher_id)`、`idx_act_category(category)`、`idx_act_deadline(registration_deadline)`、复合 `idx_act_state_start(state,start_time)` 用于广场排序。

**设计理由**
- `approved_count` 冗余：报名审批高并发，按 `max_participants` 卡名额时用乐观锁 `UPDATE ... WHERE approved_count < max_participants`，避免实时 COUNT 的竞态（BR-RG-02）。
- `summary` 与 `content` 分离：列表只取轻量 summary，详情才取富文本，减少列表查询负载。

---

## 5. registrations — 报名

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| activity_id | uuid | FK→activities.id, NOT NULL | |
| user_id | uuid | FK→users.id, NOT NULL | 报名者 |
| state | enum | NOT NULL default 'PENDING' | `PENDING` `APPROVED` `REJECTED` `CANCELLED` |
| contact | varchar(100) | NULL | 报名填写的联系方式 |
| note | varchar(500) | NULL | 报名备注 |
| reject_reason | varchar(500) | NULL | 拒绝原因 |
| reviewed_by | uuid | FK→users.id, NULL | 审批发起人 |
| reviewed_at | timestamptz | NULL | |
| cancelled_at | timestamptz | NULL | |

**索引**：`idx_reg_activity_state(activity_id,state)`、`idx_reg_user(user_id)`。
**唯一约束**：partial unique `uniq_reg_active ON (activity_id,user_id) WHERE state IN ('PENDING','APPROVED')` —— 同一活动不可重复有效报名（BR-RG-01）。

---

## 6. point_rules — 积分规则（管理员可调值/启停，内置不可删）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| code | varchar(40) | PK | 规则码（业务键），如 `ACTIVITY_JOIN` |
| description | varchar(120) | NOT NULL | 场景描述 |
| points_type | enum | NOT NULL | `GROWTH` `EXCHANGE` `BOTH` |
| amount | int | NULL | 规则数值（ADMIN_ADJUST 为 NULL 表示可变） |
| enabled | boolean | NOT NULL default true | 启用 |
| is_system | boolean | NOT NULL default true | 内置规则，禁止删除 |

**内置种子数据**

| code | description | points_type | amount |
|---|---|---|---|
| ACTIVITY_JOIN | 参与活动完成 | GROWTH | +120 |
| ACTIVITY_JOIN_E | 参与活动完成 | EXCHANGE | +50 |
| ACTIVITY_LAUNCH | 发起活动获批/结束 | GROWTH | +300 |
| CANCEL_APPROVED | 取消已通过报名 | GROWTH | -50 |
| DAILY_LOGIN | 每日签到 | EXCHANGE | +10 |
| ADMIN_ADJUST | 管理员手动调整 | BOTH | NULL |

---

## 7. point_logs — 积分流水（审计真相，只追加不修改）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL | |
| points_type | enum | NOT NULL | `GROWTH` `EXCHANGE` |
| amount | int | NOT NULL | 正增负减 |
| balance_after | int | NOT NULL | 该轨道变动后余额（快照） |
| rule_code | varchar(40) | FK→point_rules.code, NULL | 触发规则 |
| title | varchar(160) | NOT NULL | 展示文案，如「完成 RAG 精读会第 6 次」 |
| ref_type | varchar(40) | NULL | 关联对象类型：activity/reward/admin |
| ref_id | uuid | NULL | 关联对象 id |
| operator_id | uuid | FK→users.id, NULL | 管理员调整时记录操作人 |
| reason | varchar(500) | NULL | 管理员调整原因 |

**索引**：`idx_pl_user_created(user_id,created_at desc)`、`idx_pl_type(points_type)`、`idx_pl_ref(ref_type,ref_id)`。
**设计理由**：append-only 账本。任何积分变动必须在事务内：① 插 point_log ② 更新 users 冗余余额 ③（成长分变动）重算 level_id。`balance_after` 快照便于对账，无需回溯求和。

---

## 8. rewards — 福利

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| title | varchar(100) | NOT NULL | |
| description | text | NULL | |
| image_url | varchar(512) | NULL | 1:1 |
| category | enum | NOT NULL | `工具` `周边` `服务` `会员特权` |
| cost | int | NOT NULL, CHECK ≥0 | 所需兑换积分 |
| stock | int | NOT NULL, CHECK ≥0 | 库存 |
| redeemed_count | int | NOT NULL default 0 | 已兑换数 |
| status | enum | NOT NULL default 'ON_SHELF' | `ON_SHELF` `OFF_SHELF` |

**索引**：`idx_rw_status_category(status,category)`。

---

## 9. reward_orders — 兑换订单

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL | |
| reward_id | uuid | FK→rewards.id, NOT NULL | |
| cost | int | NOT NULL | 下单时快照的消耗积分 |
| state | enum | NOT NULL default 'COMPLETED' | `PENDING` `COMPLETED` `CANCELLED` `FULFILLED` |
| point_log_id | uuid | FK→point_logs.id, NULL | 关联扣分流水 |
| fulfillment_note | varchar(500) | NULL | 发放备注（实物寄送/卡密等） |

**索引**：`idx_ro_user(user_id)`、`idx_ro_reward(reward_id)`。
**设计理由**：`cost` 快照避免福利改价影响历史订单；兑换为单事务（扣积分 + 扣库存 + 建订单 + 写流水）。虚拟福利可直接 COMPLETED，实物可经 PENDING→FULFILLED。

---

## 10. notifications — 通知

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| user_id | uuid | FK→users.id, NOT NULL | 接收人 |
| type | enum | NOT NULL | `ACTIVITY_REVIEW` `LAUNCHER_REVIEW` `REGISTRATION_REVIEW` `ACTIVITY_CANCELLED` `POINTS` `SYSTEM` |
| title | varchar(120) | NOT NULL | |
| body | varchar(500) | NULL | |
| ref_type | varchar(40) | NULL | |
| ref_id | uuid | NULL | |
| is_read | boolean | NOT NULL default false | |

**索引**：`idx_nt_user_read(user_id,is_read,created_at desc)`。

---

## 11. badges & user_badges — 徽章

**badges**

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| code | varchar(40) | UNIQUE NOT NULL | 业务键，如 `FIRST_REGISTER` |
| name | varchar(40) | NOT NULL | 首次报名 / 七日连击… |
| icon | varchar(16) | NOT NULL | emoji 或图标键 |
| hint | varchar(120) | NOT NULL | 获取条件文案 |
| condition_type | enum | NOT NULL | `COUNT` `STREAK` `LEVEL` `MANUAL` |
| threshold | int | NULL | 条件阈值 |

**user_badges**（关联）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| user_id | uuid | FK→users.id, PK(复合) | |
| badge_id | uuid | FK→badges.id, PK(复合) | |
| earned_at | timestamptz | NOT NULL default now() | |

**索引**：PK `(user_id,badge_id)`、`idx_ub_user(user_id)`。

---

## 12. audit_logs — 后台操作审计（合规）

| 字段 | 类型 | 约束 | 说明 |
|---|---|---|---|
| id | uuid | PK | |
| operator_id | uuid | FK→users.id, NOT NULL | 管理员 |
| action | varchar(60) | NOT NULL | `ADJUST_POINTS` `SUSPEND_USER` `REVIEW_ACTIVITY`… |
| target_type | varchar(40) | NOT NULL | |
| target_id | uuid | NULL | |
| payload | jsonb | NULL | 变更前后快照 |
| ip | inet | NULL | |

**索引**：`idx_al_operator(operator_id,created_at desc)`、`idx_al_target(target_type,target_id)`。

---

## 13. 枚举汇总（供后端生成 type / migration）

```
USER_ROLE      = MEMBER | LAUNCHER | ADMIN
USER_STATUS    = ACTIVE | SUSPENDED | DEACTIVATING | DELETED
GENDER         = MALE | FEMALE | UNKNOWN
ACTIVITY_STATE = DRAFT | PENDING_REVIEW | PUBLISHED | REGISTRATION_OPEN | IN_PROGRESS | ENDED | REJECTED | CANCELLED
REG_STATE      = PENDING | APPROVED | REJECTED | CANCELLED
APPLY_STATUS   = PENDING | APPROVED | REJECTED
POINTS_TYPE    = GROWTH | EXCHANGE | BOTH
REWARD_STATUS  = ON_SHELF | OFF_SHELF
ORDER_STATE    = PENDING | COMPLETED | CANCELLED | FULFILLED
NOTIF_TYPE     = ACTIVITY_REVIEW | LAUNCHER_REVIEW | REGISTRATION_REVIEW | ACTIVITY_CANCELLED | POINTS | SYSTEM
```

## 14. 关键事务边界（一致性红线）

1. **积分变动**：`BEGIN → insert point_log → update users(points, level_id) → (可选)发 notification → COMMIT`。
2. **报名审批通过**：`乐观锁占名额 UPDATE activities SET approved_count=approved_count+1 WHERE id=? AND approved_count<max_participants → 命中则更新 registration.state=APPROVED，否则回滚并报「名额已满」`。
3. **活动结束发分**：批量遍历 APPROVED 报名者，每人按 ACTIVITY_JOIN(+120 growth)、ACTIVITY_JOIN_E(+50 exchange) 发分；发起人额外 ACTIVITY_LAUNCH(+300 growth)；全部置于一个事务或可重入幂等任务。
4. **兑换福利**：`扣 exchange_points（CHECK≥0）→ 扣 stock（CHECK≥0）→ 建 reward_order → 写 point_log → COMMIT`，任一失败整体回滚。
