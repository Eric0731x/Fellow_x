# FellowX State Management Structure

> Global state: Zustand (lightweight, for auth/user/theme)
> Server state: TanStack Query 5 (for all API data)
> Local state: React useState (for UI-only state like modals, form inputs)

---

## 1. State Categories

| Category | Tool | Scope | Persistence |
|----------|------|-------|-------------|
| Auth (token, login status) | Zustand | Global | localStorage |
| Current user profile | Zustand | Global | localStorage (then refresh from API) |
| Theme (dark/light, accent) | Zustand | Global | localStorage |
| API data (activities, points, etc.) | TanStack Query | Per-query | Memory cache |
| UI state (modals, forms, tabs) | React useState | Per-component | None |

---

## 2. Zustand Stores

### 2.1 Auth Store

```typescript
// stores/authStore.ts
interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  refreshAccessToken: (newToken: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (tokens) => set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
      }),

      logout: () => {
        set({ accessToken: null, refreshToken: null, isAuthenticated: false });
        // Clear all TanStack Query cache
        queryClient.clear();
      },

      refreshAccessToken: (newToken) => set({ accessToken: newToken }),
    }),
    { name: 'fellowx-auth' },
  ),
);
```

### 2.2 User Store

```typescript
// stores/userStore.ts
interface UserState {
  user: User | null;
  isLoading: boolean;

  setUser: (user: User) => void;
  clearUser: () => void;
  fetchUser: () => Promise<void>;
}

const useUserStore = create<UserState>()((set) => ({
  user: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await apiClient.get('/members/me');
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
```

### 2.3 Theme Store

```typescript
// stores/themeStore.ts
interface ThemeState {
  theme: 'light' | 'dark';
  accent: string;

  toggleTheme: () => void;
  setAccent: (color: string) => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      accent: '#ea580c',

      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setAccent: (color) => set({ accent: color }),
    }),
    { name: 'fellowx-theme' },
  ),
);
```

---

## 3. TanStack Query Configuration

### 3.1 Global Configuration

```typescript
// main.tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,           // 30s default
      retry: 1,                    // Retry once on failure
      refetchOnWindowFocus: false,  // Don't refetch on focus
    },
    mutations: {
      retry: 0,                    // No retry for mutations
    },
  },
});
```

### 3.2 Query Key Strategy

| Domain | Query Key | Stale Time |
|--------|-----------|------------|
| Activities list | `['activities', filters]` | 30s |
| Activity detail | `['activities', id]` | 60s |
| Current user | `['members', 'me']` | 5min |
| Levels | `['levels']` | 5min (rarely changes) |
| Points summary | `['points', 'summary']` | 30s |
| Points transactions | `['points', 'transactions', filters]` | 30s |
| Rewards | `['rewards', filters]` | 30s |
| My registrations | `['registrations', 'mine', filters]` | 30s |
| My orders | `['orders', 'mine', filters]` | 30s |
| Notifications | `['notifications']` | 10s |
| Admin dashboard | `['admin', 'dashboard']` | 30s |
| Admin members | `['admin', 'members', filters]` | 30s |

### 3.3 Query Hook Examples

```typescript
// api/activities.ts
export function useActivities(params: ActivityListParams) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => apiClient.get('/activities', { params }),
  });
}

export function useActivity(id: string) {
  return useQuery({
    queryKey: ['activities', id],
    queryFn: () => apiClient.get(`/activities/${id}`),
    enabled: !!id,
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityDto) => apiClient.post('/activities', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  });
}

export function useSubmitReview(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/activities/${id}/submit-review`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities', id] });
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
```

```typescript
// api/points.ts
export function usePointsSummary() {
  return useQuery({
    queryKey: ['points', 'summary'],
    queryFn: () => apiClient.get('/points/summary'),
  });
}

export function usePointTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: ['points', 'transactions', params],
    queryFn: () => apiClient.get('/points/transactions', { params }),
  });
}

export function useDailyCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post('/points/daily-check-in'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['points'] }),
  });
}
```

---

## 4. App Initialization Flow

```typescript
// main.tsx
function App() {
  const { isAuthenticated } = useAuthStore();
  const fetchUser = useUserStore((s) => s.fetchUser);

  // On mount: if authenticated, fetch user profile
  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  // ...
}
```

Prototype equivalent: `app.jsx` — `switchRole()` sets role and navigates to home. In production, `login()` stores tokens, triggers `fetchUser()`, and navigation happens via React Router.

---

## 5. Data Flow Diagrams

### 5.1 Login Flow

```
LoginPage
  └─ useMutation(login)
       └─ POST /auth/login
            ├─ onSuccess: authStore.login(tokens)
            │   ├─ Triggers: fetchUser()
            │   │   └─ GET /members/me → userStore.setUser(user)
            │   └─ Triggers: Navigate to /me
            └─ onError: show error message
```

### 5.2 Activity Registration Flow

```
ActivityDetailPage
  └─ useMutation(registerForActivity)
       └─ POST /activities/:id/register
            ├─ onSuccess:
            │   ├─ Invalidate: ['registrations', 'mine']
            │   ├─ Invalidate: ['activities', id] (update registered count)
            │   └─ Show CelebrationModal
            └─ onError:
                ├─ DUPLICATE_REGISTRATION → show "already registered"
                ├─ LEVEL_TOO_LOW → show level requirement
                ├─ ACTIVITY_FULL → show "full"
                └─ REGISTRATION_CLOSED → show "closed"
```

### 5.3 Reward Redemption Flow

```
RewardsPage
  └─ WelfareCard
       └─ useMutation(redeemReward)
            └─ POST /rewards/:id/redeem
                 ├─ onSuccess:
                 │   ├─ Invalidate: ['rewards'] (updated stock)
                 │   ├─ Invalidate: ['points', 'summary'] (updated balance)
                 │   ├─ Invalidate: ['orders', 'mine'] (new order)
                 │   └─ Show CelebrationModal
                 └─ onError:
                     ├─ INSUFFICIENT_POINTS → show deficit
                     ├─ OUT_OF_STOCK → show "sold out"
                     └─ REWARD_OFF_SHELF → show "unavailable"
```

---

## 6. Prototype State → Production Mapping

| Prototype Pattern | Production Equivalent |
|------------------|----------------------|
| `useState` for route (`setRoute`) | React Router `useNavigate` + `useParams` |
| `useState` for role (`setRole`) | Zustand `useAuthStore` (derived from JWT) |
| `useState` for theme (`setTheme`) | Zustand `useThemeStore` |
| `useState` for toast (`useToast`) | Keep as-is (UI-only state) |
| `useState` for form data | Keep as-is (local form state) |
| `FX_DATA` global mock | TanStack Query cache |
| `useTweaks` for design variants | Removed (bake decisions into final design) |
| Role switcher buttons | JWT-based auth (real roles from backend) |
| `useState` for registration list | TanStack Query `useRegistrations()` |
| `useState` for points balance | TanStack Query `usePointsSummary()` |

---

## 7. Cache Invalidation Strategy

| Mutation | Invalidate | Rationale |
|----------|-----------|-----------|
| Login | Clear all cache | Fresh start |
| Update profile | `['members', 'me']` | Stale user data |
| Create activity | `['activities']` | New item in list |
| Submit review | `['activities', id]`, `['activities']` | State changed |
| Register for activity | `['registrations', 'mine']`, `['activities', id]` | Count changed |
| Cancel registration | `['registrations', 'mine']`, `['activities', id]` | Count changed |
| Approve/reject registration | `['activities', id, 'registrations']` | State changed |
| Redeem reward | `['rewards']`, `['points', 'summary']`, `['orders', 'mine']` | Stock + balance changed |
| Daily check-in | `['points', 'summary']`, `['points', 'transactions']` | Balance changed |
| Admin adjust points | `['admin', 'members']`, `['points', 'transactions']` | Balance changed |

---

## 8. Optimistic Updates (Optional)

For low-risk mutations where immediate UI feedback matters:

```typescript
export function useCancelRegistration(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post(`/registrations/${id}/cancel`),

    // Optimistic: immediately mark as cancelled
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['registrations', 'mine'] });
      const prev = qc.getQueryData(['registrations', 'mine']);
      qc.setQueryData(['registrations', 'mine'], (old) =>
        old?.map((r) => r.id === id ? { ...r, state: 'CANCELLED' } : r)
      );
      return { prev };
    },

    // Rollback on error
    onError: (_err, _vars, context) => {
      qc.setQueryData(['registrations', 'mine'], context?.prev);
    },

    // Always refetch to sync with server
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['registrations', 'mine'] });
      qc.invalidateQueries({ queryKey: ['activities'] });
    },
  });
}
```
