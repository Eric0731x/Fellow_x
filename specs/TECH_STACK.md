# TECH_STACK.md · FellowX 技术栈（已冻结 · FROZEN）

> 本文件是技术选型的**唯一权威来源**。所有其它文档、所有 AI Agent（Claude Code / Cursor / Codex）必须遵循。
> 🔒 **已冻结**：下列选型不再讨论、不保留备选项。如需变更，必须显式修改本文件并同步全体文档，不得在任务执行中临时替换。
> 冻结日期：2026-06-04 · 决策依据：Claude Design 原型已是 React，前端与原型保持一致以零摩擦复用。

---

## 1. 冻结清单（The Frozen Stack）

### Frontend
| 关注点 | 选型 | 说明 |
|---|---|---|
| 框架 | **React 18** | 与现有 Claude Design 原型一致，直接复用组件结构 |
| 语言 | **TypeScript 5**（strict） | 全量类型；枚举对齐 DATABASE_SCHEMA §13 |
| 构建 | **Vite** | 开发/构建工具链 |
| 组件库 | **Ant Design 5** | 表格/表单/抽屉/弹窗等后台与表单密集场景 |
| 路由 | **React Router 6** | 路由守卫见 PERMISSION_MATRIX §4 |
| 状态 | **Zustand** | 轻量全局态（auth / user / theme） |
| 数据请求 | **TanStack Query (React Query) 5** | 服务端状态、缓存、重试、三态（loading/empty/error） |
| 样式 | **CSS Variables（suzhi 设计令牌）+ AntD ConfigProvider theme token** | 用设计令牌覆盖 AntD 主题，保持「素笺」视觉 |
| 表单校验 | **Ant Design Form + Zod**（共享后端 schema） | 前后端校验规则同源 |

### Backend
| 关注点 | 选型 | 说明 |
|---|---|---|
| 框架 | **NestJS 10** | 模块化、依赖注入、守卫/拦截器贴合 RBAC |
| ORM | **Prisma 5** | schema 即 DATABASE_SCHEMA.md 的落地 |
| 鉴权 | **JWT（access + refresh）** | 见 API_SPEC §1 |
| 校验 | **class-validator / Zod** | DTO 校验，错误码见 API_SPEC §9 |
| 任务调度 | **@nestjs/schedule** | 活动 autoStart/autoEnd 定时任务（STATE_MACHINE §1） |

### Database & Infra
| 关注点 | 选型 | 说明 |
|---|---|---|
| 数据库 | **PostgreSQL 14+** | 事务、partial unique、乐观锁（schema §14） |
| 对象存储 | S3 兼容（头像/封面） | 待运维确认具体服务（READINESS 必须项） |
| 缓存/队列（可选） | Redis | 限频、通知异步队列（按需，非 MVP 阻塞） |

### 小程序端
> 结构对齐 React 用户端的页面树与 API（PAGE_STRUCTURE §1）。技术实现（Taro / 原生）作为独立决策，不影响本后端与 Web 端选型；首版可仅交付 Web 端。

---

## 2. 明确拒绝的备选项（DO NOT USE）

| ❌ 不使用 | 替代为 | 原因 |
|---|---|---|
| **Vue 3** | React 18 | 原型已是 React，避免双框架与重写 |
| **Element Plus** | Ant Design 5 | 随 React 切换 |
| **Pinia** | Zustand | 随 React 切换 |
| **Vue Router** | React Router 6 | 随 React 切换 |
| Options API / `.vue` SFC | TSX 组件 | 同上 |

> ⚠️ 给 AI Agent 的硬约束：任何文档残留的 Vue/Element/Pinia 示例（如 `uploads/UI_spec.md` 第 6 节的 `vue` 代码块）**仅作交互/多态语义参考**，不作为实现语言。一律用 React + TypeScript + Ant Design 实现，不得引入 Vue 生态依赖。

---

## 3. 目录约定（建议）

```
fellowx/
├─ apps/
│  ├─ api/                 # NestJS
│  │  ├─ prisma/schema.prisma   ← DATABASE_SCHEMA.md
│  │  └─ src/modules/{auth,user,activity,registration,point,reward,admin,...}
│  └─ web/                 # React + Vite
│     ├─ src/routes/       ← PAGE_STRUCTURE.md（守卫 PERMISSION_MATRIX §4）
│     ├─ src/components/   ← 共享组件 PAGE_STRUCTURE §4
│     ├─ src/api/          ← TanStack Query hooks（对齐 API_SPEC.md）
│     ├─ src/stores/       ← Zustand（auth/user/theme）
│     └─ src/theme/        ← suzhi 设计令牌 → AntD ConfigProvider
└─ packages/
   └─ shared/              # 共享类型 + Zod schema + 枚举（DATABASE_SCHEMA §13）
```

---

## 4. 不可变约束（与选型绑定）
- 前后端**共享类型与枚举**来源单一（`packages/shared`），中文仅展示层（杜绝 PRD_REVIEW R11 枚举歧义）。
- 列表/详情统一用 TanStack Query 实现三态（PAGE_STRUCTURE 要求）。
- AntD 主题必须被 suzhi 设计令牌覆盖，视觉以原型为准，不使用 AntD 默认蓝。
- 权限：后端 NestJS Guard 为唯一防线，前端 React Router 守卫仅体验（PERMISSION_MATRIX §4 红线）。
