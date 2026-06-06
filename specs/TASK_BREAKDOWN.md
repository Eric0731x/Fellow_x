# TASK_BREAKDOWN.md · FellowX 开发任务拆解（SDD）

> 面向 Claude Code / Cursor / Codex 的迭代计划。每个 Phase：目标 · 依赖 · 任务列表 · 验收标准。
> 任务粒度按「一个 AI Agent 单次可完成且可测试」拆分。引用规则编号见 BUSINESS_RULES.md。
> **技术栈已冻结**（唯一来源见 TECH_STACK.md，不再保留备选项）：前端 **React + TypeScript + Vite + Ant Design + Zustand + React Router + TanStack Query**；后端 **NestJS + Prisma**；数据库 **PostgreSQL**。
> 推荐执行顺序：Phase 0 → 1 → 2 → 3 → 4 → 5 → 6；Phase 3/4 强耦合，建议合并验证。

---

## Phase 0 · 项目地基（Foundation）
**目标**：可运行的前后端骨架 + 数据层 + 鉴权中间件。
**依赖**：无。
**任务**
- [ ] T0.1 初始化 monorepo（api / web），统一 lint/format/commit 规范。
- [ ] T0.2 按 DATABASE_SCHEMA.md 建 Prisma schema + 迁移 + 枚举 + 索引。
- [ ] T0.3 种子脚本：5 个 levels、6 条 point_rules、徽章定义、1 个 admin 账号、样例福利。
- [ ] T0.4 统一响应包 / 错误码（API_SPEC §9）/ 全局异常过滤器 / 分页工具。
- [ ] T0.5 JWT 鉴权中间件 + RBAC 守卫（角色 + 所有权装饰器）。
- [ ] T0.6 前端外壳（**React + TypeScript + Vite**）：React Router 路由 + 角色守卫（PERMISSION_MATRIX §4）+ Ant Design 主题接入 suzhi 设计令牌（ConfigProvider theme token）+ Zustand 状态 + TanStack Query 数据层。
**验收**：迁移可重放；种子数据就绪；受保护路由返回 401/403；健康检查通过。

---

## Phase 1 · 认证与资料（Authentication）
**目标**：注册/登录/令牌/资料完善全链路。
**依赖**：Phase 0。
**任务**
- [ ] T1.1 `/auth/sms-code`、`/auth/register`、`/auth/login`、`/auth/refresh`、`/auth/logout`。
- [ ] T1.2 注册生成 member_no、初始化双轨积分=0、level=萌新。
- [ ] T1.3 `GET/PUT /members/me`；首次完善 +5 成长分（BR-AN-02）。
- [ ] T1.4 `DELETE /members/me` 注销（DEACTIVATING + 30d，BR-AN-04）。
- [ ] T1.5 `/upload/avatar`、`/upload/image`（限制 BR-AN-05）。
- [ ] T1.6 前端：登录/注册页、资料完善引导弹窗、编辑资料页（含注销危险确认）。
- [ ] T1.7 App 启动恢复登录态：有 token 拉 /members/me，失败则登出。
**验收**：注册即登录；刷新保活；token 失效跳登录；资料完善奖励仅首次；注销进入宽限期。

---

## Phase 2 · 会员中心与等级（Member Center）
**目标**：个人中心、等级体系、徽章展示。
**依赖**：Phase 1。
**任务**
- [ ] T2.1 `GET /levels`、`GET /points/summary`（含 nextLevel + progress，BR-LV-02）。
- [ ] T2.2 等级自动结算服务（成长分变更后重算 level_id，BR-LV-03 不降级）。
- [ ] T2.3 徽章授予引擎（COUNT/STREAK/LEVEL/MANUAL 条件）+ user_badges。
- [ ] T2.4 前端：个人中心（身份卡 / PointsViz / 成长阶梯 / 徽章墙）+ 三态。
**验收**：进度条用区间公式；调高阈值不降级；达成条件触发徽章 + 庆祝。

---

## Phase 3 · 活动系统（Activity System）
**目标**：活动全生命周期 + 报名审批闭环。
**依赖**：Phase 2（等级门槛）。
**任务**
- [ ] T3.1 活动 CRUD + 草稿/提交双校验（BR-AC-02）。
- [ ] T3.2 活动状态机服务（STATE_MACHINE §1）+ 生命周期端点 + 非法转换拒绝。
- [ ] T3.3 管理员活动审核（通过/驳回 + 统一驳回，BR-RV-01）。
- [ ] T3.4 报名：`register`（前置守卫 BR-RG-03 + 唯一约束 BR-RG-01）。
- [ ] T3.5 报名审批：乐观锁占名额（BR-RG-02）+ 拒绝原因；取消报名（BR-RG-06 扣分）。
- [ ] T3.6 自动流转定时任务（autoStart/autoEnd，幂等）。
- [ ] T3.7 前端：活动广场 / 详情（状态时间线 + 报名卡）/ 我发起的活动（操作矩阵）/ 创建编辑（富文本多步）/ 报名管理 / 我的报名。
**验收**：状态流转严格；并发报名不超额；名额满审批报错；驳回通知到达；危险操作二次确认。

---

## Phase 4 · 积分系统（Points System）
**目标**：双轨积分账本 + 规则引擎（贯穿活动/兑换/签到/调整）。
**依赖**：Phase 3（发分触发）。
**任务**
- [ ] T4.1 积分服务（事务：流水 + 冗余余额 + 等级重算，BR-PT-07/08）。
- [ ] T4.2 规则驱动发分：活动结束批量发分（幂等，BR-AC-06）、发起奖励。
- [ ] T4.3 每日签到（BR-PT-05 每日限一次）。
- [ ] T4.4 `GET /points/transactions`（类型筛选 + 日期分组）。
- [ ] T4.5 管理员调分（BR-PT-06，写流水 + audit_log）+ 规则调值/启停。
- [ ] T4.6 前端：我的积分（双轨概览 + 流水）/ 后台积分规则 + 全量流水 + 调整抽屉。
**验收**：余额不可为负；流水与余额一致对账；扣减唯一例外（取消通过）生效；规则停用即停发。

---

## Phase 5 · 福利商城（Reward Mall）
**目标**：福利浏览 + 兑换闭环 + 福利后台。
**依赖**：Phase 4（扣兑换积分）。
**任务**
- [ ] T5.1 `GET /rewards`（仅上架）+ 分类。
- [ ] T5.2 `redeem` 单事务（扣分 + 扣库存 + 建单 + 流水，BR-RW-02）+ 错误态。
- [ ] T5.3 `GET /orders/mine`。
- [ ] T5.4 后台福利 CRUD + 上下架。
- [ ] T5.5 前端：福利商城（按钮四态 BR-RW-03）+ 兑换确认弹窗 + 我的兑换 + 后台福利管理。
**验收**：积分不足/售罄/下架按钮态正确；并发兑换不超卖；订单 cost 快照。

---

## Phase 6 · 后台与发起人申请（Admin Dashboard）
**目标**：仪表盘、会员治理、发起人审核、等级配置、审核中心、通知。
**依赖**：Phase 1–5。
**任务**
- [ ] T6.1 发起人申请（POST /launchers/apply，唯一 PENDING，BR-RV-03）+ 审核（通过升级 role）。
- [ ] T6.2 `GET /admin/dashboard` 汇总（指标 + 待办 + 趋势 + 等级分布）。
- [ ] T6.3 会员管理（搜索/筛选/详情/封禁解封 BR-AN-06）。
- [ ] T6.4 等级管理（PUT /admin/levels，不回溯 BR-LV-03）。
- [ ] T6.5 审核中心（活动 + 发起人统一界面）。
- [ ] T6.6 通知中心（列表/已读，BR-NT）。
- [ ] T6.7 audit_logs 贯穿所有后台写操作。
**验收**：待办数与实际一致；封禁用户被全链路拦截；发起人通过即解锁专区；后台操作全留痕。

---

## 横切关注点（贯穿所有 Phase）
- **测试**：每个状态机转换、每条 BR 规则配单测；并发场景（名额/库存/重复）配集成测试。
- **三态 UI**：每个列表/详情交付加载/空/错误（PAGE_STRUCTURE 要求）。
- **响应式**：3 断点（移动 TabBar / 折叠侧栏 / 完整）。
- **可观测**：关键写操作埋点 + 结构化日志 + 错误码统计。
- **幂等与安全**：发分/生命周期幂等；后端独立校验权限与所有权（不信任前端）。

---

## 依赖关系图
```
Phase 0 ──┬─→ Phase 1 ─→ Phase 2 ─→ Phase 3 ─→ Phase 4 ─→ Phase 5
          │                                         │
          └─────────────────────────────────────────┴─→ Phase 6
```
