# PAGE_STRUCTURE.md · FellowX 页面树

> 端：Web（响应式，≥1280 完整 / 768–1280 折叠侧栏 / <768 移动底部 TabBar）+ 小程序（结构对齐 Web 用户端）。
> 标注：`[Public]` 公开 · `[Auth]` 需登录 · `[Launcher]` · `[Admin]`。导航随角色切换（见 PERMISSION_MATRIX §4）。
> 每个列表/详情页须实现三态：加载（骨架）/ 空 / 错误（重试）。

---

## 1. 用户端（C 端 · Web + 小程序）

```
FellowX (用户端)
│
├─ /                         [Public]  首页 / Landing
│
├─ /activities               [Public]  活动广场（分类筛选 · 卡片网格）
│   └─ /activities/:id        [Public]  活动详情（状态时间线 · 报名进度 · 报名卡）
│
├─ /rewards                  [Public]  福利商城（分类 Tab · 卡片网格）
│   └─ (兑换确认弹窗)         [Auth]    确认消耗 / 余额
│
├─ /login  /register        [Public]  登录 / 注册（已登录则重定向）
│   └─ (资料完善引导弹窗)     [Auth]    首次登录强引导
│
├─ /me                       [Auth]    个人中心
│   ├─ 身份卡（头像/等级/会员号/连击/统计）
│   ├─ 双轨积分可视化 · 成长阶梯 · 徽章墙
│   └─ 快捷入口
│       ├─ /points           [Auth]    我的积分（双轨概览 + 流水筛选）
│       ├─ /me/registrations [Auth]    我的报名（Tab：全部/待审/通过/拒绝/取消）
│       ├─ /orders           [Auth]    我的兑换记录
│       ├─ /me/edit          [Auth]    编辑资料（含注销入口）
│       └─ /launcher/apply   [Auth]    申请发起人（≥同行者可见）
│
└─ /launcher                 [Launcher] 发起人专区
    ├─ /launcher/activities          我发起的活动（Tab：草稿/待审/已发布/报名中/进行中/已结束）
    ├─ /launcher/activities/create   创建活动（基本信息 → 时间人数 → 预览）
    ├─ /launcher/activities/:id/edit 编辑活动（草稿/驳回件回填）
    └─ /launcher/activities/:id/registrations  报名管理（审批 · 搜索 · 批量）
```

### 1.1 导航结构（用户端 TopBar，按角色）
| 角色 | 顶栏导航 |
|---|---|
| Guest | 首页 · 活动 · 福利 · 登录 |
| Member | 个人中心 · 活动 · 我的积分 · 兑换商城 |
| Launcher | 个人中心 · 我的活动 · 活动 · 兑换商城 |

移动端：顶栏精简，主导航下沉为底部 TabBar（首页 / 活动 / 福利 / 我的）。

---

## 2. 后台管理端（B 端 · 仅 Web）

```
FellowX Admin                              [Admin]
│
├─ /admin/dashboard          数据仪表盘
│   ├─ 4 指标卡（会员 / 进行中活动 / 本月积分 / 本月兑换，含环比）
│   ├─ 待处理事项（待审活动 / 待审发起人 / 待审报名）
│   ├─ 近 7 日新增趋势 · 等级分布
│   └─ 最近注册会员
│
├─ /admin/review             审核中心
│   ├─ Tab 活动审核（待审/已通过/已驳回 · 查看完整内容 · 通过/驳回）
│   └─ Tab 发起人审核（待审/已通过/已驳回 · 简介展开 · 通过/驳回）
│
├─ /admin/members            会员管理
│   ├─ 搜索（姓名/手机/会员号）+ 等级/状态筛选 + 分页
│   ├─ 行操作：查看详情 / 调整积分（抽屉）/ 封禁·解封
│   └─ /admin/members/:id    会员详情
│
├─ /admin/rewards            福利管理
│   ├─ Tab 上架中/已下架/全部 · 列表（积分/库存/已兑换/状态）
│   └─ 创建·编辑福利（抽屉）/ 上下架
│
├─ /admin/points             积分管理
│   ├─ /admin/points/rules         规则配置（调值/启停，内置不可删）
│   └─ /admin/points/transactions  全量流水（会员/类型/日期筛选 + 手动调整入口）
│
└─ /admin/levels             等级管理（阈值/名称/特权 · 提示不回溯降级）
```

### 2.1 导航结构（后台侧栏）
仪表盘 · 审核中心 · 会员管理 · 福利 · 积分 · 等级。
后台不展示任何 C 端入口（福利商城/个人中心）。

---

## 3. 页面 → 数据/接口 映射（关键页）

| 页面 | 主接口 | 关键组件 |
|---|---|---|
| 活动广场 | GET /activities | ActivityCard(3 变体) · 分类 Tab · 空/错误态 |
| 活动详情 | GET /activities/:id · POST …/register | 状态时间线 · 报名进度环 · 报名卡(吸顶) |
| 个人中心 | GET /members/me · GET /levels | 身份卡 · PointsViz(3 变体) · 成长阶梯 · 徽章墙 |
| 我的积分 | GET /points/summary · /transactions | 双轨概览 · 流水分组 · 类型筛选 |
| 我的报名 | GET /registrations/mine | 状态 Tab · 报名卡 · 取消确认 |
| 编辑资料 | PUT /members/me · DELETE /members/me | 头像上传 · 表单校验 · 注销危险确认 |
| 申请发起人 | POST /launchers/apply · GET …/mine | 资格说明 · 简介输入 · 审核进度态 |
| 我发起的活动 | GET /launcher/activities | 状态 Tab · 操作矩阵按状态显隐 |
| 创建/编辑活动 | POST/PUT /activities · submit-review | 多步表单 · 富文本 · 草稿/提交双校验 |
| 报名管理 | GET …/registrations · review | 审批卡 · 拒绝原因弹窗 · 批量 |
| 仪表盘 | GET /admin/dashboard | 指标卡 · 待办 · 趋势图 · 等级分布 |
| 会员管理 | GET /admin/members · status · adjust | 表格 · 调分抽屉 · 封禁确认 |
| 审核中心 | review 列表 · review 操作 | 审核卡 · 统一驳回弹窗 |
| 福利管理 | GET/POST/PUT /admin/rewards | 表格 · 编辑抽屉 · 上下架 |
| 积分管理 | point-rules · transactions · adjust | 规则表 · 流水表 · 手动调整 |
| 等级管理 | GET/PUT /admin/levels | 等级表 · 编辑弹窗 |

---

## 4. 共享组件清单（跨页复用）
`StatusBadge`（活动/报名状态色）· `LevelBadge`（5 级徽标）· `PointsDisplay`（双轨，3 布局）· `ConfirmDialog`（危险二次确认）· `RejectDialog`（统一驳回原因）· `LoadingSkeleton`（card/list/profile）· `EmptyState` · `ErrorState`（重试）· `AvatarFallback`（首字+等级色）· `Pagination` · `UploadCropper`（头像 1:1 / 封面 16:9）。
