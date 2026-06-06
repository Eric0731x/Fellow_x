# PERMISSION_MATRIX.md · FellowX RBAC 权限矩阵

> 模型：RBAC（基于角色）。角色单值：`GUEST`（未登录）、`MEMBER`、`LAUNCHER`、`ADMIN`。
> 继承关系：`LAUNCHER ⊃ MEMBER`（发起人拥有全部会员权限 + 发起能力）。`ADMIN` 为独立后台身份。
> 资源所有权：标 `(own)` 表示仅限本人/本人发起的对象；`(any)` 表示跨用户。
> 图例：✅ 允许 · ⛔ 禁止 · 🔶 条件允许（见脚注）

---

## 1. 角色定义

| 角色 | 获得方式 | 说明 |
|---|---|---|
| GUEST | 未登录 | 只读公开内容，任何写操作引导登录 |
| MEMBER | 手机号注册 | 基础身份，含个人中心/报名/兑换 |
| LAUNCHER | 申请并经 Admin 审核通过 | Member 超集 + 活动发起与管理 |
| ADMIN | 平台后台分配（不可自助注册） | 全站治理 |

---

## 2. 资源 × 操作 主矩阵

操作集：`Create / Read / Update / Delete / Approve / Adjust`

### 2.1 User（用户/资料）
| 操作 | GUEST | MEMBER | LAUNCHER | ADMIN |
|---|---|---|---|---|
| Read 自己资料 | ⛔ | ✅(own) | ✅(own) | ✅(own) |
| Read 他人公开资料 | 🔶¹ | ✅ | ✅ | ✅(any) |
| Update 自己资料 | ⛔ | ✅(own) | ✅(own) | ✅ |
| Delete（注销）自己 | ⛔ | ✅(own) | ✅(own) | ⛔² |
| Read 全量会员列表 | ⛔ | ⛔ | ⛔ | ✅(any) |
| Update 状态（封禁/解封） | ⛔ | ⛔ | ⛔ | ✅(any) |
| Adjust 积分 | ⛔ | ⛔ | ⛔ | ✅(any) |

### 2.2 Activity（活动）
| 操作 | GUEST | MEMBER | LAUNCHER | ADMIN |
|---|---|---|---|---|
| Read 已发布活动 | ✅ | ✅ | ✅ | ✅ |
| Read 草稿/待审 | ⛔ | ⛔ | ✅(own) | ✅(any) |
| Create | ⛔ | ⛔ | ✅ | ⛔³ |
| Update | ⛔ | ⛔ | ✅(own,🔶状态) | ⛔ |
| Delete（草稿） | ⛔ | ⛔ | ✅(own,DRAFT) | ⛔ |
| Submit Review | ⛔ | ⛔ | ✅(own) | — |
| Approve / Reject（审核） | ⛔ | ⛔ | ⛔ | ✅(any) |
| 生命周期（开放报名/开始/结束/取消） | ⛔ | ⛔ | ✅(own,🔶状态) | ⛔⁴ |

### 2.3 Registration（报名）
| 操作 | GUEST | MEMBER | LAUNCHER | ADMIN |
|---|---|---|---|---|
| Create（报名） | ⛔ | 🔶⁵ | 🔶⁵ | ⛔ |
| Read 自己的报名 | ⛔ | ✅(own) | ✅(own) | ✅(any) |
| Read 某活动报名名单 | ⛔ | ⛔ | ✅(own活动) | ✅(any) |
| Cancel（取消报名） | ⛔ | ✅(own,🔶状态) | ✅(own) | ⛔ |
| Approve / Reject 报名 | ⛔ | ⛔ | ✅(own活动) | ✅(any) |

### 2.4 Reward / RewardOrder（福利与兑换）
| 操作 | GUEST | MEMBER | LAUNCHER | ADMIN |
|---|---|---|---|---|
| Read 上架福利 | ✅ | ✅ | ✅ | ✅ |
| Redeem（兑换/下单） | ⛔ | 🔶⁶ | 🔶⁶ | ⛔ |
| Read 自己订单 | ⛔ | ✅(own) | ✅(own) | ✅(any) |
| Create/Update/Delete 福利 | ⛔ | ⛔ | ⛔ | ✅ |
| 上架/下架 | ⛔ | ⛔ | ⛔ | ✅ |
| Fulfill 订单 | ⛔ | ⛔ | ⛔ | ✅ |

### 2.5 PointRule / PointLog（积分规则与流水）
| 操作 | GUEST | MEMBER | LAUNCHER | ADMIN |
|---|---|---|---|---|
| Read 自己流水 | ⛔ | ✅(own) | ✅(own) | ✅(any) |
| Read 全量流水 | ⛔ | ⛔ | ⛔ | ✅ |
| Update 规则（调值/启停） | ⛔ | ⛔ | ⛔ | ✅ |
| Delete 规则 | ⛔ | ⛔ | ⛔ | ⛔⁷ |
| Adjust（手动增减积分） | ⛔ | ⛔ | ⛔ | ✅(any) |

### 2.6 LauncherApplication（发起人申请）
| 操作 | GUEST | MEMBER | LAUNCHER | ADMIN |
|---|---|---|---|---|
| Create（申请） | ⛔ | 🔶⁸ | ⛔⁹ | ⛔ |
| Read 自己申请 | ⛔ | ✅(own) | ✅(own) | ✅(any) |
| Approve / Reject | ⛔ | ⛔ | ⛔ | ✅(any) |

### 2.7 Level（等级）
| 操作 | GUEST | MEMBER | LAUNCHER | ADMIN |
|---|---|---|---|---|
| Read 等级体系 | ✅ | ✅ | ✅ | ✅ |
| Update 阈值/特权/名称 | ⛔ | ⛔ | ⛔ | ✅¹⁰ |

---

## 3. 条件脚注（业务守卫）

1. GUEST 仅可见公开字段（昵称、等级、头像），不含手机号/邮箱/积分明细。
2. ADMIN 不能直接删除用户，只能封禁；注销是用户主权操作。
3. ADMIN 不创建活动（保持「发起人负责制」）；如需平台活动，由 Admin 账号同时具备 Launcher 能力，属扩展项，本期不做。
4. ADMIN 仅审核活动（通过/驳回），不代发起人执行开放报名/开始/结束/取消生命周期操作。
5. 报名前置：`role≥MEMBER` 且 `status=ACTIVE` 且 活动 `state=REGISTRATION_OPEN` 且 未过 `registration_deadline` 且 `user.level ≥ activity.min_level` 且 名额未满 且 未重复有效报名。
6. 兑换前置：`status=ACTIVE` 且 `exchange_points ≥ reward.cost` 且 `reward.status=ON_SHELF` 且 `stock>0`。
7. 内置规则（is_system=true）禁止删除，仅可调值/启停。
8. 申请前置：`level.can_apply_launcher=true`（同行者起）且 无 PENDING 申请 且 当前非 LAUNCHER。
9. 已是 LAUNCHER 不可重复申请。
10. 修改等级阈值**不回溯**降级存量会员（BR-LV-03）。

---

## 4. 路由级访问守卫（前端 + 后端双重校验）

| 路由前缀 | 要求 | 未满足处理 |
|---|---|---|
| `/`、`/activities`、`/activities/:id`、`/rewards` | 公开 | — |
| `/me/**`、`/points`、`/orders` | 已登录 | 跳 `/login?redirect=` |
| `/launcher/**` | role=LAUNCHER | 提示「需要发起人权限」→ 跳 `/me` |
| `/launcher/apply` | role=MEMBER 且可申请 | 不满足隐藏入口/Tooltip |
| `/admin/**` | role=ADMIN | 403 / 跳首页 |

> 安全红线：**后端每个写接口都必须独立做权限与所有权校验**，前端守卫仅用于体验，不可作为唯一防线。所有权校验示例：`PUT /activities/:id` 必须校验 `activity.launcher_id == currentUser.id`。
