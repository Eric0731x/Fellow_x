# FellowX Backend Architecture

> Stack: NestJS 10 + Prisma 5 + PostgreSQL 14+ + JWT (access + refresh)
> Pattern: Layered architecture per module (Controller → Service → Prisma)

---

## 1. Directory Structure

```
apps/api/
├── prisma/
│   ├── schema.prisma             # Database schema (maps to DATABASE_SCHEMA.md)
│   ├── seed.ts                   # Seed script (levels, point_rules, admin, sample data)
│   └── migrations/               # Auto-generated migrations
├── src/
│   ├── main.ts                   # NestJS bootstrap
│   ├── app.module.ts             # Root module
│   ├── common/                   # Shared infrastructure
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   ├── current-user.decorator.ts
│   │   │   └── ownership.decorator.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   ├── roles.guard.ts
│   │   │   └── ownership.guard.ts
│   │   ├── interceptors/
│   │   │   ├── response.interceptor.ts    # Uniform { code, message, data }
│   │   │   ├── audit.interceptor.ts       # Log admin writes to audit_logs
│   │   │   └── transform.interceptor.ts   # Pagination envelope
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts   # Uniform error response
│   │   ├── pipes/
│   │   │   └── zod-validation.pipe.ts     # Zod schema validation
│   │   ├── dto/
│   │   │   └── pagination.dto.ts          # Shared pagination DTO
│   │   └── utils/
│   │       ├── idempotency.ts             # Idempotency-Key header handling
│   │       └── optimistic-lock.ts         # Optimistic lock helper
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts         # POST /auth/*
│   │   │   ├── auth.service.ts            # Login, register, token refresh
│   │   │   ├── auth.guard.ts              # JWT validation
│   │   │   ├── dto/
│   │   │   │   ├── register.dto.ts
│   │   │   │   ├── login.dto.ts
│   │   │   │   └── sms-code.dto.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   ├── user/
│   │   │   ├── user.module.ts
│   │   │   ├── user.controller.ts         # GET/PUT/DELETE /members/me
│   │   │   ├── user.service.ts
│   │   │   └── dto/
│   │   │       ├── update-profile.dto.ts
│   │   │       └── upload.dto.ts
│   │   ├── activity/
│   │   │   ├── activity.module.ts
│   │   │   ├── activity.controller.ts     # CRUD + lifecycle endpoints
│   │   │   ├── activity.service.ts
│   │   │   ├── activity-state.service.ts  # State machine logic
│   │   │   ├── activity.scheduler.ts      # autoStart/autoEnd cron
│   │   │   └── dto/
│   │   │       ├── create-activity.dto.ts
│   │   │       ├── update-activity.dto.ts
│   │   │       └── lifecycle.dto.ts
│   │   ├── registration/
│   │   │   ├── registration.module.ts
│   │   │   ├── registration.controller.ts
│   │   │   ├── registration.service.ts
│   │   │   └── dto/
│   │   │       ├── register.dto.ts
│   │   │       └── review.dto.ts
│   │   ├── point/
│   │   │   ├── point.module.ts
│   │   │   ├── point.controller.ts        # /points/* endpoints
│   │   │   ├── point.service.ts           # Core ledger logic
│   │   │   ├── point-rule.service.ts      # Rule engine
│   │   │   └── dto/
│   │   │       ├── adjust.dto.ts
│   │   │       └── check-in.dto.ts
│   │   ├── reward/
│   │   │   ├── reward.module.ts
│   │   │   ├── reward.controller.ts
│   │   │   ├── reward.service.ts
│   │   │   ├── order.service.ts
│   │   │   └── dto/
│   │   │       ├── redeem.dto.ts
│   │   │       └── fulfill.dto.ts
│   │   ├── launcher/
│   │   │   ├── launcher.module.ts
│   │   │   ├── launcher.controller.ts
│   │   │   ├── launcher.service.ts
│   │   │   └── dto/
│   │   │       └── apply.dto.ts
│   │   ├── admin/
│   │   │   ├── admin.module.ts
│   │   │   ├── admin.controller.ts        # /admin/* endpoints
│   │   │   ├── admin.service.ts           # Dashboard aggregation
│   │   │   ├── member-manage.service.ts
│   │   │   ├── review.service.ts
│   │   │   └── dto/
│   │   │       ├── adjust-points.dto.ts
│   │   │       ├── update-status.dto.ts
│   │   │       └── review.dto.ts
│   │   ├── notification/
│   │   │   ├── notification.module.ts
│   │   │   ├── notification.controller.ts
│   │   │   └── notification.service.ts
│   │   ├── level/
│   │   │   ├── level.module.ts
│   │   │   ├── level.controller.ts
│   │   │   └── level.service.ts
│   │   └── upload/
│   │       ├── upload.module.ts
│   │       ├── upload.controller.ts
│   │       └── upload.service.ts
│   └── config/
│       ├── app.config.ts
│       ├── database.config.ts
│       └── jwt.config.ts
├── test/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── nest-cli.json
├── tsconfig.json
└── package.json
```

---

## 2. Module Dependency Graph

```
AuthModule
├── UserModule (registration creates user)
├── PointModule (registration initializes points)
└── LevelModule (registration assigns initial level)

ActivityModule
├── RegistrationModule (lifecycle triggers registration side-effects)
├── PointModule (activity end triggers points issuance)
└── NotificationModule (lifecycle triggers notifications)

RegistrationModule
├── ActivityModule (quota check, approved_count)
├── PointModule (cancel approved → deduct points)
└── NotificationModule (review results)

PointModule
├── LevelModule (growth points change → recalc level)
└── NotificationModule (optional points notifications)

RewardModule
├── PointModule (redeem → deduct exchange points)
└── NotificationModule (order status)

AdminModule
├── ActivityModule (review activities)
├── LauncherModule (review applications)
├── UserModule (member management)
├── PointModule (adjust points)
├── LevelModule (configure levels)
└── NotificationModule (system announcements)
```

---

## 3. Request Lifecycle

```
Client Request
    │
    ▼
JwtAuthGuard (validate token, attach user to request)
    │
    ▼
RolesGuard (check user.role against @Roles() decorator)
    │
    ▼
OwnershipGuard (if @Ownership() decorator, verify resource.owner matches user)
    │
    ▼
ZodValidationPipe (validate request body/params/query against Zod schema)
    │
    ▼
Controller (route handler, delegates to service)
    │
    ▼
Service (business logic, state machine, transactions)
    │
    ▼
Prisma (database operations)
    │
    ▼
ResponseInterceptor (wrap in { code: 0, message: "ok", data: ... })
    │
    ▼
HttpExceptionFilter (catch errors, return { code, message })
```

---

## 4. Guard & Decorator Strategy

### 4.1 Role Hierarchy

```typescript
// roles.decorator.ts
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);

// roles.guard.ts
// LAUNCHER inherits all MEMBER permissions
const roleHierarchy: Record<UserRole, UserRole[]> = {
  ADMIN: ['ADMIN'],
  LAUNCHER: ['LAUNCHER', 'MEMBER'],
  MEMBER: ['MEMBER'],
};
```

### 4.2 Ownership Validation

```typescript
// ownership.decorator.ts
export const Ownership = (resource: string) => SetMetadata('ownership', resource);

// ownership.guard.ts
// Checks: activity.launcher_id === currentUser.id
//         registration.user_id === currentUser.id
//         etc.
```

### 4.3 Endpoint Permission Summary

| Endpoint Group | Auth | Role | Ownership |
|---------------|------|------|-----------|
| `POST /auth/*` | No | — | — |
| `GET /activities` | No | — | — |
| `GET /activities/:id` | No (public states) | — | — |
| `POST /activities` | Yes | LAUNCHER | — |
| `PUT /activities/:id` | Yes | LAUNCHER | launcher_id |
| `POST /activities/:id/lifecycle` | Yes | LAUNCHER | launcher_id |
| `POST /admin/*` | Yes | ADMIN | — |
| `GET /members/me` | Yes | MEMBER | self |
| `PUT /members/me` | Yes | MEMBER | self |

---

## 5. State Machine Service

Each state machine is implemented as a dedicated service:

```typescript
// activity-state.service.ts
@Injectable()
export class ActivityStateService {
  private readonly transitions: Record<ActivityState, ActivityEvent[]> = {
    DRAFT: ['update', 'submitReview', 'delete', 'cancel'],
    PENDING_REVIEW: ['approve', 'reject', 'cancel'],
    REJECTED: ['update', 'resubmit', 'cancel'],
    PUBLISHED: ['openRegistration', 'cancel'],
    REGISTRATION_OPEN: ['start', 'cancel', 'autoStart'],
    IN_PROGRESS: ['end', 'cancel', 'autoEnd'],
    ENDED: [],
    CANCELLED: [],
  };

  async transition(activityId: string, event: ActivityEvent, actor: User): Promise<Activity> {
    const activity = await this.prisma.activity.findUnique({ where: { id: activityId } });
    const allowed = this.transitions[activity.state];

    if (!allowed.includes(event)) {
      throw new ConflictException('INVALID_STATE_TRANSITION');
    }

    // Execute transition + side effects in transaction
    return this.prisma.$transaction(async (tx) => {
      const newState = this.getTargetState(activity.state, event);
      const updated = await tx.activity.update({
        where: { id: activityId },
        data: { state: newState, ...this.getSideEffectData(event) },
      });

      await this.executeSideEffects(tx, event, updated, actor);
      return updated;
    });
  }
}
```

---

## 6. Points Service (Critical Path)

The points service is the most transaction-sensitive module:

```typescript
// point.service.ts
@Injectable()
export class PointService {
  async award(params: AwardPointsParams): Promise<PointLog> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Insert point_log
      const log = await tx.pointLog.create({
        data: {
          userId: params.userId,
          pointsType: params.type,
          amount: params.amount,
          balanceAfter: 0, // placeholder, updated below
          ruleCode: params.ruleCode,
          title: params.title,
          refType: params.refType,
          refId: params.refId,
        },
      });

      // 2. Update user balance — conditional update to prevent negative balance
      //    For deductions (amount < 0), add a WHERE guard so affected_rows = 0
      //    triggers INSUFFICIENT_POINTS instead of a raw Prisma/DB error
      const balanceField = params.type === 'GROWTH' ? 'growthPoints' : 'exchangePoints';
      const where = params.amount < 0
        ? { id: params.userId, [balanceField]: { gte: Math.abs(params.amount) } }
        : { id: params.userId };
      const user = await tx.user.update({
        where,
        data: { [balanceField]: { increment: params.amount } },
      });
      if (!user) throw new ConflictException('INSUFFICIENT_POINTS');

      // 3. Update balance_after snapshot
      await tx.pointLog.update({
        where: { id: log.id },
        data: {
          balanceAfter: params.type === 'GROWTH' ? user.growthPoints : user.exchangePoints,
        },
      });

      // 4. Recalc level if growth points changed
      if (params.type === 'GROWTH') {
        await this.levelService.recalcLevel(tx, params.userId, user.growthPoints);
      }

      return { ...log, balanceAfter: params.type === 'GROWTH' ? user.growthPoints : user.exchangePoints };
    });
  }
}
```

---

## 7. Audit Logging

All admin write operations are logged:

```typescript
// audit.interceptor.ts
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user?.role === 'ADMIN' && ['POST', 'PUT', 'DELETE'].includes(request.method)) {
      return next.handle().pipe(
        tap(async () => {
          await this.prisma.auditLog.create({
            data: {
              operatorId: user.id,
              action: this.extractAction(request),
              targetType: this.extractTargetType(request),
              targetId: request.params.id,
              payload: { body: request.body, query: request.query },
              ip: request.ip,
            },
          });
        }),
      );
    }

    return next.handle();
  }
}
```

---

## 8. Scheduled Tasks

```typescript
// activity.scheduler.ts
@Injectable()
export class ActivityScheduler {
  @Cron('* * * * *') // Every minute
  async autoTransition() {
    const now = new Date();

    // autoStart: REGISTRATION_OPEN + start_time <= now
    await this.prisma.activity.updateMany({
      where: { state: 'REGISTRATION_OPEN', start_time: { lte: now } },
      data: { state: 'IN_PROGRESS' },
    });

    // autoEnd: IN_PROGRESS + end_time <= now → triggers points issuance
    const toEnd = await this.prisma.activity.findMany({
      where: { state: 'IN_PROGRESS', end_time: { lte: now } },
    });

    for (const activity of toEnd) {
      await this.activityStateService.transition(activity.id, 'autoEnd', null);
    }
  }
}
```

---

## 9. Error Handling

### 9.1 Uniform Error Response

```typescript
// http-exception.filter.ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      code: typeof exceptionResponse === 'object' && 'code' in exceptionResponse
        ? (exceptionResponse as any).code
        : this.mapStatusToCode(status),
      message: typeof exceptionResponse === 'object' && 'message' in exceptionResponse
        ? (exceptionResponse as any).message
        : exception.message,
    });
  }
}
```

### 9.2 Business Error Codes

Mapped from API_SPEC §9:

| Code | HTTP | Thrown By |
|------|------|-----------|
| `VALIDATION` | 400 | ZodValidationPipe |
| `CREDENTIAL_INVALID` | 401 | AuthService.login |
| `TOKEN_INVALID` | 401 | JwtStrategy |
| `FORBIDDEN` | 403 | RolesGuard, OwnershipGuard |
| `LEVEL_TOO_LOW` | 403 | RegistrationService.register |
| `NOT_FOUND` | 404 | All services |
| `DUPLICATE_REGISTRATION` | 409 | RegistrationService (unique constraint) |
| `ACTIVITY_FULL` | 409 | RegistrationService (optimistic lock) |
| `INVALID_STATE_TRANSITION` | 409 | State machine services |
| `INSUFFICIENT_POINTS` | 409 | RewardService.redeem |
| `ALREADY_CHECKED_IN` | 409 | PointService.checkIn |
| `RATE_LIMITED` | 429 | ThrottlerGuard |

---

## 10. Prisma Service Integration

```typescript
// prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit' as any, async () => {
      await app.close();
    });
  }
}
```

Each module injects `PrismaService` and uses it directly (no repository abstraction layer — Prisma Client IS the repository).
