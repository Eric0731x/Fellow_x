# FellowX Architecture Review

> Source of truth: `specs/` directory (10 SDD documents)
> UI reference: `FellowX/` prototype (11 files, React + Babel standalone)

---

## 1. System Overview

FellowX is a **membership management and incentive system** for an AI-focused community. It implements a dual-track points system (growth + exchange), activity lifecycle management, reward redemption, and role-based administration.

### Core Domains

| Domain | Responsibility | Key Entities |
|--------|---------------|--------------|
| **Identity** | Registration, auth, profile, deactivation | User, Level |
| **Activity** | Full lifecycle (draft → review → publish → open → run → end) | Activity, Registration |
| **Points** | Dual-track ledger, rule engine, daily check-in | PointRule, PointLog |
| **Reward** | Reward catalog, redemption, order fulfillment | Reward, RewardOrder |
| **Governance** | Launcher applications, admin review, audit | LauncherApplication, AuditLog |
| **Engagement** | Badges, streaks, notifications | Badge, UserBadge, Notification |

### Architecture Style

- **Monorepo** with two apps (`api/`, `web/`) and one shared package (`packages/shared/`)
- **Backend**: NestJS 10 (modular, DI, guards/interceptors) + Prisma 5 (ORM) + PostgreSQL 14+
- **Frontend**: React 18 + TypeScript 5 (strict) + Vite + Ant Design 5
- **Pattern**: Layered architecture per NestJS module (Controller → Service → Repository/Prisma)

---

## 2. Frozen Tech Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Frontend framework | React | 18 | Prototype already in React; zero-friction reuse |
| Language | TypeScript | 5 (strict) | Type safety; enums align with DB schema |
| Build tool | Vite | latest | Fast HMR, ESM-native |
| Component library | Ant Design | 5 | Tables, forms, drawers, modals for admin-heavy UI |
| Routing | React Router | 6 | Route guards per PERMISSION_MATRIX §4 |
| Global state | Zustand | latest | Lightweight (auth, user, theme) |
| Server state | TanStack Query | 5 | Caching, retries, loading/empty/error tri-state |
| Styling | CSS Variables + AntD ConfigProvider | — | Suzhi design tokens override AntD defaults |
| Form validation | Zod | — | Shared schemas between frontend and backend |
| Backend framework | NestJS | 10 | Modular, DI, guards fit RBAC perfectly |
| ORM | Prisma | 5 | Schema-as-code maps to DATABASE_SCHEMA.md |
| Auth | JWT (access + refresh) | — | Stateless, API_SPEC §1 |
| Task scheduling | @nestjs/schedule | — | Activity autoStart/autoEnd cron |
| Database | PostgreSQL | 14+ | Transactions, partial unique, optimistic locking |

**Explicitly rejected**: Vue 3, Element Plus, Pinia, Vue Router (prototype is React; no dual-framework).

---

## 3. Key Architectural Decisions

### 3.1 Monorepo Structure

```
fellowx/
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── prisma/schema.prisma
│   │   └── src/modules/{auth,user,activity,registration,point,reward,admin,...}
│   └── web/                    # React frontend
│       ├── src/routes/
│       ├── src/components/
│       ├── src/api/            # TanStack Query hooks
│       ├── src/stores/         # Zustand stores
│       └── src/theme/          # Suzhi design tokens → AntD ConfigProvider
└── packages/
    └── shared/                 # Shared types, Zod schemas, enums
```

### 3.2 RBAC Model

- **Single-value role enum**: `MEMBER | LAUNCHER | ADMIN` (not multi-role table)
- **Inheritance**: `LAUNCHER ⊃ MEMBER` (superset of permissions)
- **ADMIN** is independent backend identity
- **Ownership enforcement**: Every write endpoint validates `resource.owner_id == currentUser.id`
- **Frontend guards are UX-only**; backend guards are the security boundary

### 3.3 Dual-Track Points System

- **Growth points**: Only increase, determine level, never consumed
- **Exchange points**: Can increase/decrease, used for rewards, independent of level
- **Ledger pattern**: Append-only `point_logs` + redundant `users.growth_points/exchange_points`
- **Transaction boundary**: Every points change = single DB transaction (insert log + update balance + recalc level)

### 3.4 Optimistic Locking for Concurrency

- **Registration approval**: `UPDATE activities SET approved_count = approved_count + 1 WHERE id = ? AND approved_count < max_participants`
- **Reward redemption**: Single transaction (deduct points + deduct stock + create order + write log)
- **Partial unique constraints**: Prevent duplicate active registrations and duplicate pending applications

### 3.5 State Machine Pattern

Four explicit state machines with event-driven transitions:
1. **Activity**: DRAFT → PENDING_REVIEW → PUBLISHED → REGISTRATION_OPEN → IN_PROGRESS → ENDED (+ REJECTED, CANCELLED)
2. **Registration**: PENDING → APPROVED → REJECTED / CANCELLED
3. **LauncherApplication**: PENDING → APPROVED / REJECTED
4. **RewardOrder**: PENDING → COMPLETED / FULFILLED / CANCELLED

All illegal transitions return `409 INVALID_STATE_TRANSITION`.

### 3.6 Design Language: Suzhi (素笺)

- **Philosophy**: "黑白为骨，单色为魂" (black-white skeleton, single-accent soul)
- **Implementation**: CSS custom properties (`--ink`, `--surface`, `--accent`) with dark/light theme
- **AntD integration**: ConfigProvider theme tokens overridden by Suzhi values
- **Prototype reference**: `FellowX/suzhi.css` is the design token source

---

## 4. Non-Functional Requirements

| Concern | Strategy |
|---------|----------|
| **Performance** | Indexed queries, paginated lists (default 20, max 100), summary/content split for activities |
| **Security** | JWT auth, bcrypt passwords, backend-only permission checks, rich-text whitelist sanitization |
| **Consistency** | DB transactions for points/orders/approvals, optimistic locking for quotas |
| **Observability** | Audit logs for all admin actions, structured logging, error code metrics |
| **Idempotency** | Points issuance and lifecycle transitions are idempotent (dedup by activity_id) |
| **Timezone** | UTC storage (timestamptz), ISO 8601 transport, frontend localizes |

---

## 5. Risk Register (from PRD Review)

| Risk | Severity | Mitigation |
|------|----------|------------|
| Over-selling quotas under concurrency | HIGH | Optimistic lock + unique constraints |
| Points ledger inconsistency | HIGH | Single-transaction writes + balance_after snapshots |
| Duplicate points issuance | HIGH | Idempotent by activity_id |
| Permission bypass (frontend-only guards) | HIGH | Backend per-endpoint ownership checks |
| State machine illegal transitions | MEDIUM | Centralized state service + 409 rejection + full test coverage |
| XSS in rich-text content | MEDIUM | Server-side whitelist sanitization |

---

## 6. Prototype-to-Production Mapping

The FellowX prototype (`FellowX/`) is a **purely client-side React app** using Babel standalone and global `window` assignments. It serves as the **UI reference** for the production build. Key mappings:

| Prototype | Production |
|-----------|------------|
| `data.js` (mock data) | Prisma seed + API responses |
| `app.jsx` (routing via switch) | React Router 6 with route guards |
| `components.jsx` (global functions) | Typed React components with props interfaces |
| `suzhi.css` (design tokens) | CSS Variables + AntD ConfigProvider theme |
| `tweaks-panel.jsx` (design variants) | Removed in production; decisions baked into final design |
| Role switcher (UI toggle) | JWT-based auth with real role from backend |
| `window.FX_DATA` | TanStack Query cache + Zustand stores |
