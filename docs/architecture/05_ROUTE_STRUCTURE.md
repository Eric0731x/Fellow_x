# FellowX Route Structure

> Frontend routing: React Router 6
> Guards: Role-based, defined in PERMISSION_MATRIX §4
> Mobile: Bottom TabBar for primary navigation

---

## 1. Route Definitions

### 1.1 Public Routes (No Auth)

| Path | Page | Description |
|------|------|-------------|
| `/` | LandingPage | Hero, featured activities, dual-track explainer, CTA |
| `/activities` | ActivitiesPage | Activity grid/list with category filter |
| `/activities/:id` | ActivityDetailPage | Status timeline, registration card, detail content |
| `/rewards` | RewardsPage | Reward catalog with category tabs |
| `/login` | LoginPage | Phone + password/SMS login |
| `/register` | RegisterPage | Phone + password registration |

### 1.2 Member Routes (Auth Required)

| Path | Page | Description |
|------|------|-------------|
| `/me` | MemberHomePage | Identity card, points viz, badge wall, quick links |
| `/me/edit` | EditProfilePage | Avatar, name, gender, birthday, email, deactivation |
| `/me/registrations` | RegistrationsPage | My registrations with status tabs |
| `/me/launcher-apply` | LauncherApplyPage | Application form (MEMBER only, level ≥ L2) |
| `/points` | PointsPage | Dual-track overview + transaction history |
| `/orders` | OrdersPage | My redemption records |
| `/rewards` | RewardsPage | Same as public but with exchange capability |

### 1.3 Launcher Routes (LAUNCHER Role)

| Path | Page | Description |
|------|------|-------------|
| `/launcher/activities` | LauncherActivitiesPage | My activities + registration review |
| `/launcher/activities/create` | CreateActivityPage | Multi-step creation wizard |
| `/launcher/activities/:id/edit` | EditActivityPage | Edit draft/rejected activity |
| `/launcher/activities/:id/registrations` | RegistrationManagePage | Registration list + approve/reject |

### 1.4 Admin Routes (ADMIN Role)

| Path | Page | Description |
|------|------|-------------|
| `/admin/dashboard` | DashboardPage | KPIs, trends, level distribution, pending items |
| `/admin/review` | ReviewPage | Activity review + launcher application review tabs |
| `/admin/members` | MembersPage | Member list, search, adjust points, suspend/unsuspend |
| `/admin/members/:id` | MemberDetailPage | Individual member detail |
| `/admin/rewards` | RewardsManagePage | Reward CRUD, shelf management |
| `/admin/points/rules` | PointRulesPage | Rule configuration (adjust amount, toggle) |
| `/admin/points/transactions` | PointTransactionsPage | Full transaction log with filters |
| `/admin/levels` | LevelsPage | Level threshold configuration |

---

## 2. Route Guard Implementation

```typescript
// routes/index.tsx
const routes: RouteConfig[] = [
  // Public
  { path: '/', element: lazy(() => import('./pages/public/LandingPage')), guard: 'guest' },
  { path: '/activities', element: lazy(() => import('./pages/public/ActivitiesPage')), guard: 'guest' },
  { path: '/activities/:id', element: lazy(() => import('./pages/public/ActivityDetailPage')), guard: 'guest' },
  { path: '/rewards', element: lazy(() => import('./pages/public/RewardsPage')), guard: 'guest' },
  { path: '/login', element: lazy(() => import('./pages/public/LoginPage')), guard: 'guest' },
  { path: '/register', element: lazy(() => import('./pages/public/RegisterPage')), guard: 'guest' },

  // Member
  { path: '/me', element: lazy(() => import('./pages/member/MemberHomePage')), guard: 'auth' },
  { path: '/me/edit', element: lazy(() => import('./pages/member/EditProfilePage')), guard: 'auth' },
  { path: '/me/registrations', element: lazy(() => import('./pages/member/RegistrationsPage')), guard: 'auth' },
  { path: '/me/launcher-apply', element: lazy(() => import('./pages/member/LauncherApplyPage')), guard: 'auth' },
  { path: '/points', element: lazy(() => import('./pages/member/PointsPage')), guard: 'auth' },
  { path: '/orders', element: lazy(() => import('./pages/member/OrdersPage')), guard: 'auth' },

  // Launcher
  { path: '/launcher/activities', element: lazy(() => import('./pages/launcher/LauncherActivitiesPage')), guard: 'launcher' },
  { path: '/launcher/activities/create', element: lazy(() => import('./pages/launcher/CreateActivityPage')), guard: 'launcher' },
  { path: '/launcher/activities/:id/edit', element: lazy(() => import('./pages/launcher/EditActivityPage')), guard: 'launcher' },
  { path: '/launcher/activities/:id/registrations', element: lazy(() => import('./pages/launcher/RegistrationManagePage')), guard: 'launcher' },

  // Admin
  { path: '/admin/dashboard', element: lazy(() => import('./pages/admin/DashboardPage')), guard: 'admin' },
  { path: '/admin/review', element: lazy(() => import('./pages/admin/ReviewPage')), guard: 'admin' },
  { path: '/admin/members', element: lazy(() => import('./pages/admin/MembersPage')), guard: 'admin' },
  { path: '/admin/members/:id', element: lazy(() => import('./pages/admin/MemberDetailPage')), guard: 'admin' },
  { path: '/admin/rewards', element: lazy(() => import('./pages/admin/RewardsManagePage')), guard: 'admin' },
  { path: '/admin/points/rules', element: lazy(() => import('./pages/admin/PointRulesPage')), guard: 'admin' },
  { path: '/admin/points/transactions', element: lazy(() => import('./pages/admin/PointTransactionsPage')), guard: 'admin' },
  { path: '/admin/levels', element: lazy(() => import('./pages/admin/LevelsPage')), guard: 'admin' },
];
```

### 2.1 Guard Components

```typescript
// AuthRoute.tsx
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
}

// LauncherRoute.tsx — Admin does NOT inherit launcher permissions (PERMISSION_MATRIX §4)
function LauncherRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (!user || user.role !== 'LAUNCHER') {
    return <Navigate to="/me" replace />;
  }

  return <>{children}</>;
}

// AdminRoute.tsx
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
```

---

## 3. Navigation Structure

### 3.1 Desktop TopBar

| Role | Items |
|------|-------|
| Guest | Landing, Activities, Rewards, Login button |
| Member | Member Home, Activities, Points, Rewards |
| Launcher | Member Home, My Activities, Activities, Rewards |
| Admin | Dashboard, Review, Members, Rewards, Points, Levels |

### 3.2 Mobile Bottom TabBar

| Tab | Icon | Route |
|-----|------|-------|
| Home | house | `/` or `/me` |
| Activities | grid | `/activities` |
| Rewards | gift | `/rewards` |
| Me | user | `/me` or `/admin/dashboard` |

### 3.3 Admin Sidebar (Desktop Only)

```
Dashboard (/admin/dashboard)
Review Center (/admin/review)
Member Management (/admin/members)
Rewards (/admin/rewards)
Points
├── Rules (/admin/points/rules)
└── Transactions (/admin/points/transactions)
Levels (/admin/levels)
```

---

## 4. Page Template Pattern

Every page follows the same template structure:

```typescript
function PageTemplate() {
  const { data, isLoading, error, refetch } = useQuery(...);

  return (
    <div className="wrap-page fade-up">
      <PageHead n="编号" title="页面标题" sub="副标题描述" action={<Button />} />

      {/* Loading state */}
      {isLoading && <LoadingSkeleton variant="card" />}

      {/* Error state */}
      {error && <ErrorState onRetry={refetch} />}

      {/* Empty state */}
      {!isLoading && !error && !data?.length && (
        <EmptyState icon="layers" text="暂无内容" />
      )}

      {/* Data state */}
      {data?.length > 0 && <DataList data={data} />}
    </div>
  );
}
```

---

## 5. Route Transitions

- **Same-level navigation**: Instant content swap with `fade-up` animation
- **Scroll behavior**: Scroll to top on route change (`window.scrollTo({ top: 0, behavior: 'instant' })`)
- **Key strategy**: `key={route.name + param}` forces remount on param change (prototype pattern)

Prototype reference: `app.jsx` line 42 — `const go = (name, param) => { setRoute({ name, param }); window.scrollTo({ top: 0 }); }`

---

## 6. Prototype Route Mapping

| Prototype Route Name | Production Path | Guard |
|---------------------|----------------|-------|
| `landing` | `/` | guest |
| `activities` | `/activities` | guest |
| `activity` (param: id) | `/activities/:id` | guest |
| `login` | `/login` | guest |
| `register` | `/register` | guest |
| `member-home` | `/me` | auth |
| `points` | `/points` | auth |
| `exchange` | `/rewards` | auth |
| `me-edit` | `/me/edit` | auth |
| `me-registrations` | `/me/registrations` | auth |
| `launcher-activities` | `/launcher/activities` | launcher |
| `create-activity` | `/launcher/activities/create` | launcher |
| `launcher-apply` | `/me/launcher-apply` | auth (MEMBER, level ≥ L2) |
| `admin-dashboard` | `/admin/dashboard` | admin |
| `admin-review` | `/admin/review` | admin |
| `admin-members` | `/admin/members` | admin |
| `admin-welfares` | `/admin/rewards` | admin |
| `admin-points` | `/admin/points/rules` | admin |
| `admin-levels` | `/admin/levels` | admin |
