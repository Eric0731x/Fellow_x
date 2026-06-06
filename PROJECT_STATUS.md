# FellowX - Project Status

## Completed Phases

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| 0 | Project Scaffold | Done | Monorepo setup, Prisma schema, NestJS + React bootstrapping |
| 1 | Auth & User | Done | JWT auth, registration, login, profile CRUD, guards |
| 2 | Member Home | Done | Member homepage, profile editing, level display |
| 3 | Activity System | Done | Activity CRUD, state machine, registration flow, review |
| 4 | Points System | Done | Transaction-safe award/deduct, level recalculation, daily check-in, admin adjustment |
| 5 | Reward Mall | Done | Reward CRUD, atomic redemption, order history, admin management |
| 6 | Admin Dashboard & Governance | Done | Launcher applications, dashboard stats, member/level management, notifications |
| 7 | MVP Stabilization | Done | Bug fixes, documentation, demo preparation |

## Architecture Summary

- **Monorepo**: npm workspaces with `apps/api`, `apps/web`, `packages/shared`
- **Backend**: NestJS 10 + Prisma 5 + PostgreSQL 14
- **Frontend**: React 19 + TypeScript + Vite + Ant Design 5
- **Auth**: JWT dual tokens with refresh rotation
- **24 routes** across public, member, launcher, and admin sections

## Known Limitations

### Not Implemented (Out of MVP Scope)

1. **File Upload**: `UploadService` endpoints return 501 Not Implemented. Avatar and image upload require S3 or local storage integration.
2. **Badge System**: `Badge` and `UserBadge` models exist in the schema but no award logic is implemented.
3. **Audit Logging**: `AuditLog` model exists but no automatic audit trail is written.
4. **Email/SMS**: No email or SMS delivery. Registration uses phone+password only.
5. **Physical Fulfillment**: Reward orders are created as COMPLETED immediately. No fulfillment tracking workflow.
6. **Notification UI**: Notification API is complete (`GET /notifications`, `PUT /notifications/:id/read`, `PUT /notifications/read-all`) but no dedicated notification page or header dropdown exists in the frontend.
7. **Registration Cancel Points Deduction**: The deduction logic exists in the service but the frontend registration cancel flow does not surface the points impact.

### Frontend Placeholder Pages

The following admin pages render static placeholder text instead of real data:

| Route | Page | Status |
|-------|------|--------|
| `/admin/review` | ReviewPage | Placeholder — backend endpoints work, frontend not wired |
| `/admin/points/rules` | PointRulesPage | Placeholder — backend endpoints work, frontend not wired |
| `/admin/points/transactions` | PointTransactionsPage | Placeholder — backend endpoints work, frontend not wired |

### Architecture Notes

- AdminService creates notifications via Prisma directly rather than through NotificationService. This works but bypasses any future notification business logic.
- OwnershipGuard is registered globally but only checks `activity` resources. Other resource types would need additional cases.

## Source of Truth

- `/specs` — Business rules, state machines, permission matrix
- `/docs/architecture` — Architecture documentation

## Next Roadmap

1. **File Upload**: Integrate S3 or local storage for avatar and activity cover images.
2. **Notification Center**: Build a notification dropdown/badge in the header and a full notification page.
3. **Badge System**: Implement automatic badge awarding based on participation milestones.
4. **Audit Trail**: Write audit logs for admin actions (point adjustments, member status changes, reviews).
5. **Complete Admin Pages**: Wire up ReviewPage, PointRulesPage, PointTransactionsPage with real data.
6. **Fulfillment Workflow**: Add order states for physical reward tracking (PENDING → FULFILLED).
7. **Search & Filtering**: Add full-text search for activities and members.
8. **Analytics**: Activity participation trends, points distribution charts, member growth metrics.
