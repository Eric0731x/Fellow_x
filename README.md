# FellowX - AI Community Membership Management Platform

An AI community membership management platform for activity organization, points accumulation, and reward redemption.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Ant Design 5 |
| Backend | NestJS 10 + Prisma 5 + PostgreSQL 14+ |
| Shared | TypeScript monorepo (npm workspaces) |
| Auth | JWT dual tokens (access 15m + refresh 7d) |

## Project Structure

```
cc_06/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # React frontend
├── packages/
│   ├── shared/       # Shared types and enums
│   └── config/       # Shared configuration
├── docker-compose.yml
└── package.json      # Workspace root
```

## Setup

### Prerequisites

- Node.js >= 18
- Docker (for PostgreSQL)
- npm

### 1. Start Database

```bash
docker compose up -d
```

This starts PostgreSQL 14 on port 5433.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Copy the example env file and edit if needed:

```bash
cp .env.example apps/api/.env
```

Default values work with the Docker PostgreSQL setup.

### 4. Run Migrations & Seed

```bash
npm run db:generate -w apps/api
npm run db:migrate -w apps/api
npm run db:seed -w apps/api
```

### 5. Start Development Servers

```bash
npm run dev
```

This starts both API (port 3000) and web (port 5173) concurrently.

Or start them individually:

```bash
npm run dev:api    # API on http://localhost:3000
npm run dev:web    # Web on http://localhost:5173
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start all dev servers |
| `npm run dev:api` | Start API dev server only |
| `npm run dev:web` | Start web dev server only |
| `npm run build` | Build all workspaces |
| `npm run build:shared` | Build shared package |
| `npm run build:api` | Build API |
| `npm run build:web` | Build web |
| `npm run typecheck` | Typecheck all workspaces |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://fellowx:fellowx@localhost:5433/fellowx` | PostgreSQL connection string |
| `JWT_SECRET` | (required) | Access token signing secret |
| `JWT_REFRESH_SECRET` | (required) | Refresh token signing secret |
| `JWT_EXPIRES_IN` | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token TTL |
| `PORT` | `3000` | API server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |

## Seed Accounts

| Role | Phone | Password | Name |
|------|-------|----------|------|
| Admin | 13800000000 | admin123 | 系统管理员 |
| Member | 13900000001 | member123 | 张小明 |
| Member | 13900000002 | member123 | 李小红 |
| Member | 13900000003 | member123 | 王大力 |
| Launcher | 13900000010 | launcher123 | 赵发起 |

## Core Features

- **Member System**: Registration, login, profile management, level progression
- **Activity System**: Create, publish, register, approve, lifecycle management
- **Points System**: Growth points (level) + Exchange points (rewards), transaction-safe
- **Reward Mall**: Browse, redeem with exchange points, order history
- **Governance**: Launcher applications, admin dashboard, member/level management, notifications
