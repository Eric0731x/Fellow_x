# FellowX Frontend Architecture

> Stack: React 18 + TypeScript 5 (strict) + Vite + Ant Design 5 + React Router 6 + Zustand + TanStack Query 5
> Design system: Suzhi (素笺) via CSS Variables + AntD ConfigProvider theme tokens

---

## 1. Directory Structure

```
apps/web/src/
├── main.tsx                    # Entry point, providers
├── App.tsx                     # Router + layout shell
├── routes/                     # Route definitions + guards
│   ├── index.tsx               # Route config array
│   ├── GuestRoute.tsx          # Public route wrapper
│   ├── AuthRoute.tsx           # Requires login
│   ├── LauncherRoute.tsx       # Requires LAUNCHER role
│   └── AdminRoute.tsx          # Requires ADMIN role
├── pages/                      # Page components (one per route)
│   ├── public/
│   │   ├── LandingPage.tsx
│   │   ├── ActivitiesPage.tsx
│   │   ├── ActivityDetailPage.tsx
│   │   ├── RewardsPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── member/
│   │   ├── MemberHomePage.tsx
│   │   ├── PointsPage.tsx
│   │   ├── RegistrationsPage.tsx
│   │   ├── OrdersPage.tsx
│   │   ├── EditProfilePage.tsx
│   │   └── LauncherApplyPage.tsx
│   ├── launcher/
│   │   ├── LauncherActivitiesPage.tsx
│   │   ├── CreateActivityPage.tsx
│   │   ├── EditActivityPage.tsx
│   │   └── RegistrationManagePage.tsx
│   └── admin/
│       ├── DashboardPage.tsx
│       ├── ReviewPage.tsx
│       ├── MembersPage.tsx
│       ├── RewardsManagePage.tsx
│       ├── PointsManagePage.tsx
│       └── LevelsPage.tsx
├── components/                 # Shared components
│   ├── StatusBadge.tsx
│   ├── LevelBadge.tsx
│   ├── PointsDisplay.tsx       # 3 variants: rings, bignum, orbit
│   ├── ConfirmDialog.tsx
│   ├── RejectDialog.tsx
│   ├── LoadingSkeleton.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── AvatarFallback.tsx
│   ├── Pagination.tsx
│   ├── UploadCropper.tsx
│   ├── ActivityCard.tsx        # 3 variants: hairline, cover, status
│   └── WelfareCard.tsx
├── api/                        # TanStack Query hooks (one file per domain)
│   ├── auth.ts
│   ├── user.ts
│   ├── activities.ts
│   ├── registrations.ts
│   ├── points.ts
│   ├── rewards.ts
│   ├── launcher.ts
│   ├── admin.ts
│   └── client.ts               # Axios instance with interceptors
├── stores/                     # Zustand stores (lightweight global state)
│   ├── authStore.ts
│   ├── userStore.ts
│   └── themeStore.ts
├── theme/                      # Design system
│   ├── tokens.ts               # Suzhi design tokens → AntD theme
│   ├── ThemeProvider.tsx        # AntD ConfigProvider wrapper
│   └── suzhi.css               # CSS custom properties (from prototype)
├── hooks/                      # Custom hooks
│   ├── useAuth.ts
│   ├── useRouteGuard.ts
│   └── useBreakpoint.ts
├── utils/                      # Utilities
│   ├── format.ts               # Date, number, phone formatting
│   ├── validation.ts           # Zod schemas (shared with backend)
│   └── constants.ts            # Enums, route paths
└── types/                      # TypeScript types
    └── index.ts                # Re-exports from packages/shared
```

---

## 2. Component Architecture

### 2.1 Component Hierarchy

```
App
├── ThemeProvider (AntD ConfigProvider + Suzhi tokens)
│   ├── BrowserRouter
│   │   ├── TopBar (sticky, glass effect)
│   │   │   ├── Logo
│   │   │   ├── NavLinks (role-based)
│   │   │   ├── RoleSwitcher (dev only)
│   │   │   └── AuthButton / UserMenu
│   │   ├── Routes
│   │   │   ├── GuestRoute → public pages
│   │   │   ├── AuthRoute → member pages
│   │   │   ├── LauncherRoute → launcher pages
│   │   │   └── AdminRoute → admin pages
│   │   └── Footer (landing/activities only)
│   └── Toast container
└── TweaksPanel (dev/design only, removed in production)
```

### 2.2 Shared Component Contracts

All shared components follow these conventions:

```typescript
// Props interface pattern
interface StatusBadgeProps {
  state: ActivityState | RegistrationState;
  variant?: 'activity' | 'registration';
}

// Three-state rendering (loading / empty / error)
interface ListPageProps<T> {
  data: T[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  renderItem: (item: T) => React.ReactNode;
  emptyIcon?: string;
  emptyText?: string;
}
```

### 2.3 Activity Card Variants

The prototype defines 3 visual variants for activity cards, controlled by a design tweak:

| Variant | Style | Use Case |
|---------|-------|----------|
| `hairline` | Bordered card with category chip + status badge | Default grid view |
| `cover` | Cover image header + content below | Featured/promoted activities |
| `status` | Left border colored by state | List view with state emphasis |

Production decision: Use `cover` variant for landing page featured section, `hairline` for grid view, `status` for list view.

### 2.4 Points Visualization Variants

| Variant | Style | Use Case |
|---------|-------|----------|
| `rings` | Dual ring (growth + exchange) with progress bar | Default on member home |
| `bignum` | Large numbers side by side with bar | Compact/stat-focused view |
| `orbit` | Dark card with ring + orbital layout | Premium/prominent display |

Production decision: Use `rings` as default, `bignum` on points detail page header.

---

## 3. Routing & Navigation

### 3.1 Route Configuration

```typescript
interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<() => JSX.Element>;
  guard: 'guest' | 'auth' | 'launcher' | 'admin';
  layout?: 'default' | 'admin';
}
```

### 3.2 Navigation Structure by Role

| Role | TopBar Items | Home Route |
|------|-------------|------------|
| Guest | Landing, Activities, Login | `/` |
| Member | Member Home, Activities, Points, Rewards | `/me` |
| Launcher | Member Home, My Activities, Activities, Rewards | `/me` |
| Admin | Dashboard, Review, Members, Rewards, Points, Levels | `/admin/dashboard` |

### 3.3 Mobile Navigation

- Breakpoint: `<768px`
- TopBar collapses to minimal (logo + auth)
- Bottom TabBar appears with primary navigation
- Admin panel: No mobile optimization (desktop-only)

---

## 4. Design System Integration

### 4.1 Suzhi Token → AntD Theme Mapping

```typescript
// theme/tokens.ts
const suzhiTheme = {
  token: {
    colorPrimary: '#ea580c',        // --accent
    colorBgContainer: '#ffffff',     // --surface
    colorBgLayout: '#fafaf9',        // --bg
    colorText: '#0a0a0a',            // --ink
    colorTextSecondary: '#525252',   // --ink-2
    colorBorder: 'rgba(10,10,10,.07)', // --hairline
    borderRadius: 10,                // --r-sm
    fontFamily: "'Inter', 'PingFang SC', system-ui, sans-serif",
  },
  algorithm: theme.defaultAlgorithm, // or theme.darkAlgorithm
};
```

### 4.2 CSS Custom Properties

The prototype's `suzhi.css` defines the full token set. In production:
- Import `suzhi.css` for utility classes (`.row`, `.col`, `.gap-*`, `.fade-up`)
- Use AntD components for complex UI (Table, Form, Drawer, Modal)
- Override AntD theme via ConfigProvider, not CSS

### 4.3 Typography Scale

| Class | Usage | Spec |
|-------|-------|------|
| `.t-hero` | Landing headline | 40–64px, display font |
| `.t-h2` | Page title | 26–34px, display font |
| `.t-h3` | Card title | 16px, display font |
| `.t-body` | Body text | 14px, body font |
| `.t-sub` | Secondary text | 12px |
| `.t-cap` | Caption/label | 11px |
| `.t-num` | Large numbers | Display font, tabular-nums |

---

## 5. Three-State Pattern (Loading / Empty / Error)

Every list and detail page implements:

```typescript
function PageComponent() {
  const { data, isLoading, error, refetch } = useQuery(...);

  if (isLoading) return <LoadingSkeleton variant="card" />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyState icon="layers" text="暂无内容" />;

  return <DataList data={data} />;
}
```

Prototype reference: The prototype has no loading/error states (all data is synchronous mock). Production must add these.

---

## 6. Responsive Breakpoints

| Breakpoint | Layout | Prototype Behavior |
|------------|--------|-------------------|
| `≥1280px` | Full layout, side panels | `.m-grid` two-column |
| `768–1280px` | Collapsed sidebar, stacked grid | `.m-grid` single-column |
| `<768px` | Mobile: bottom TabBar, compact cards | `.mobile-nav` visible, `.auth-aside` hidden |

---

## 7. Form Patterns

### 7.1 Validation

- Use **Zod** schemas shared with backend (`packages/shared/schemas/`)
- AntD Form integration via `zodResolver`
- Inline error display under fields

### 7.2 Multi-Step Forms

Activity creation uses a 4-step wizard:
1. Basic info (title, category, summary, cover)
2. Time & capacity (dates, location, max participants)
3. Thresholds & rewards (min level, growth reward)
4. Preview & submit

Prototype reference: `CreateActivityScreen` in `screens-launcher.jsx`

### 7.3 Dangerous Operations

All destructive actions require `ConfirmDialog`:
- Account deactivation (30-day grace period)
- Cancel registration (penalty warning if APPROVED)
- Activity cancellation (notify all registrants)
- Admin: suspend user, reject application

---

## 8. Prototype Decisions to Preserve vs. Discard

| Decision | Action | Rationale |
|----------|--------|-----------|
| Suzhi design tokens | **Preserve** | Core brand identity |
| Card variants (3 types) | **Preserve** | Visual variety for different contexts |
| Points viz variants (3 types) | **Preserve** | User preference / context-appropriate |
| Role switcher in UI | **Discard** | Production uses real JWT auth |
| TweaksPanel | **Discard** | Design tool, not production feature |
| Gamification toggle | **Decide** | Keep as user preference? Or always-on? |
| Font switcher (Manrope/hei/serif) | **Discard** | Lock to Manrope + system fallbacks |
| Theme toggle (light/dark) | **Preserve** | User preference |
