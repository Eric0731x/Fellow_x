# FellowX API Layer Structure

> Base URL: `/api`
> Auth: `Authorization: Bearer <accessToken>` (JWT)
> Response envelope: `{ "code": 0, "message": "ok", "data": ... }`
> Pagination: `{ "items": [], "total": number, "page": number, "pageSize": number }`
> Time: ISO 8601 UTC
> Source: `specs/API_SPEC.md`

---

## 1. Endpoint Registry

### 1.1 Auth (`/auth`)

| Method | Path | Permission | Request | Response | Errors |
|--------|------|-----------|---------|----------|--------|
| POST | `/auth/register` | Public | `{ phone, password, name, smsCode }` | `{ accessToken, refreshToken, user }` 201 | PHONE_EXISTS(409), SMS_INVALID(400) |
| POST | `/auth/login` | Public | `{ phone, password }` or `{ phone, smsCode }` | `{ accessToken, refreshToken, user }` 200 | CREDENTIAL_INVALID(401), USER_SUSPENDED(403) |
| POST | `/auth/refresh` | Public | `{ refreshToken }` | `{ accessToken }` 200 | TOKEN_INVALID(401) |
| POST | `/auth/logout` | Auth | — | 204 | — |
| POST | `/auth/sms-code` | Public | `{ phone, scene }` | 204 | RATE_LIMITED(429) |

### 1.2 User (`/members`)

| Method | Path | Permission | Request | Response | Errors |
|--------|------|-----------|---------|----------|--------|
| GET | `/members/me` | Auth(own) | — | Full user profile | TOKEN_INVALID(401) |
| PUT | `/members/me` | Auth(own) | `{ name?, gender?, birthday?, email?, avatarUrl? }` | Updated user | VALIDATION(400) |
| DELETE | `/members/me` | Auth(own) | — | `{ deactivateAt }` | — |
| POST | `/upload/avatar` | Auth | multipart `file` | `{ url }` | FILE_TOO_LARGE(413), FILE_TYPE(415) |
| POST | `/upload/image` | Auth | multipart `file` | `{ url }` | FILE_TOO_LARGE(413), FILE_TYPE(415) |

### 1.3 Activities (`/activities`)

| Method | Path | Permission | Request | Response | Errors |
|--------|------|-----------|---------|----------|--------|
| GET | `/activities` | Public | Query: `category?, state?, keyword?, page, pageSize, sort` | Paginated ActivityCard[] | — |
| GET | `/activities/:id` | Public* | — | Full Activity | NOT_FOUND(404), FORBIDDEN(403) |
| POST | `/activities` | Launcher | `{ title, category?, summary?, location?, content?, ... }` | Activity 201 | — |
| PUT | `/activities/:id` | Launcher(own, DRAFT/REJECTED) | Partial Activity | Activity | INVALID_STATE_TRANSITION(409), FORBIDDEN(403) |
| POST | `/activities/:id/submit-review` | Launcher(own) | — | Activity | VALIDATION(400) |
| POST | `/activities/:id/lifecycle` | Launcher(own) | `{ action: "openRegistration"\|"start"\|"end"\|"cancel" }` | Activity | INVALID_STATE_TRANSITION(409) |
| DELETE | `/activities/:id` | Launcher(own, DRAFT) | — | 204 | — |

*Draft/PENDING_REVIEW only visible to own launcher or admin

### 1.4 Registration (`/registrations`)

| Method | Path | Permission | Request | Response | Errors |
|--------|------|-----------|---------|----------|--------|
| POST | `/activities/:id/register` | Member/Launcher | `{ contact?, note? }` | Registration 201 | DUPLICATE_REGISTRATION(409), LEVEL_TOO_LOW(403), ACTIVITY_FULL(409), REGISTRATION_CLOSED(409) |
| GET | `/registrations/mine` | Auth(own) | Query: `state?, page, pageSize` | Paginated registrations | — |
| POST | `/registrations/:id/cancel` | Member(own, PENDING/APPROVED) | — | Registration | — |
| GET | `/activities/:id/registrations` | Launcher(own activity) | Query: `state?, keyword?, page, pageSize` | Paginated registrations | — |
| POST | `/registrations/:id/review` | Launcher(own activity) | `{ approved: true }` or `{ approved: false, rejectReason }` | Registration | ACTIVITY_FULL(409), VALIDATION(400) |

### 1.5 Points (`/points`)

| Method | Path | Permission | Request | Response | Errors |
|--------|------|-----------|---------|----------|--------|
| GET | `/points/summary` | Auth(own) | — | `{ growthPoints, exchangePoints, level, nextLevel, progress }` | — |
| GET | `/points/transactions` | Auth(own) | Query: `pointsType?, page, pageSize` | Paginated PointLog[] | — |
| POST | `/points/daily-check-in` | Auth | — | `{ awarded: 10 }` | ALREADY_CHECKED_IN(409) |
| GET | `/levels` | Public | — | Level[] | — |

### 1.6 Rewards (`/rewards`)

| Method | Path | Permission | Request | Response | Errors |
|--------|------|-----------|---------|----------|--------|
| GET | `/rewards` | Public | Query: `category?, page, pageSize` | Paginated Reward[] | — |
| POST | `/rewards/:id/redeem` | Member/Launcher | — | RewardOrder 201 | INSUFFICIENT_POINTS(409), OUT_OF_STOCK(409), REWARD_OFF_SHELF(409) |
| GET | `/orders/mine` | Auth(own) | Query: `page, pageSize` | Paginated RewardOrder[] | — |

### 1.7 Launcher Application (`/launchers`)

| Method | Path | Permission | Request | Response | Errors |
|--------|------|-----------|---------|----------|--------|
| POST | `/launchers/apply` | Member | `{ description }` (≤500) | Application 201 | DUPLICATE_APPLICATION(409), LEVEL_TOO_LOW(403) |
| GET | `/launchers/apply/mine` | Auth(own) | — | Application status | — |

### 1.8 Admin (`/admin`)

| Method | Path | Permission | Description |
|--------|------|-----------|-------------|
| GET | `/admin/dashboard` | Admin | Dashboard aggregation |
| GET | `/admin/members` | Admin | Member list (keyword/level/status) |
| GET | `/admin/members/:id` | Admin | Member detail |
| PUT | `/admin/members/:id/status` | Admin | `{ status: ACTIVE\|SUSPENDED }` |
| POST | `/admin/points/adjust` | Admin | `{ memberId, pointsType, amount, reason }` |
| GET | `/admin/points/transactions` | Admin | Full transaction log |
| GET | `/admin/point-rules` | Admin | Point rules list |
| PUT | `/admin/point-rules/:code` | Admin | `{ amount?, enabled? }` |
| GET | `/admin/rewards` | Admin | All rewards |
| POST | `/admin/rewards` | Admin | Create reward |
| PUT | `/admin/rewards/:id` | Admin | Update reward |
| PUT | `/admin/rewards/:id/status` | Admin | Toggle ON_SHELF/OFF_SHELF |
| GET | `/admin/levels` | Admin | Level config |
| PUT | `/admin/levels/:id` | Admin | Update level |
| GET | `/admin/activities/review` | Admin | Pending/reviewed activities |
| POST | `/admin/activities/:id/review` | Admin | Approve/reject activity |
| GET | `/admin/launchers` | Admin | Launcher applications |
| POST | `/admin/launchers/:id/review` | Admin | Approve/reject application |
| GET | `/notifications` | Auth(own) | User notifications |
| PUT | `/notifications/:id/read` | Auth(own) | Mark as read |
| PUT | `/notifications/read-all` | Auth(own) | Mark all as read |

---

## 2. Request/Response Patterns

### 2.1 Axios Client Configuration

```typescript
// api/client.ts
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle token refresh
apiClient.interceptors.response.use(
  (response) => response.data.data, // Unwrap envelope
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) return apiClient.request(error.config);
      useAuthStore.getState().logout();
    }
    return Promise.reject(error.response?.data || error);
  },
);
```

### 2.2 TanStack Query Hook Pattern

```typescript
// api/activities.ts
export function useActivities(params: ActivityListParams) {
  return useQuery({
    queryKey: ['activities', params],
    queryFn: () => apiClient.get('/activities', { params }),
    staleTime: 30_000,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActivityDto) => apiClient.post('/activities', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['activities'] }),
  });
}
```

### 2.3 Error Handling in Components

```typescript
function ActivityPage() {
  const { data, isLoading, error, refetch } = useActivity(id);

  if (isLoading) return <LoadingSkeleton />;
  if (error) {
    const code = error.response?.data?.code;
    if (code === 'NOT_FOUND') return <NotFound />;
    if (code === 'FORBIDDEN') return <Forbidden />;
    return <ErrorState onRetry={refetch} />;
  }

  return <ActivityDetail data={data} />;
}
```

---

## 3. Error Code Reference

| Code | HTTP | Meaning | Client Action |
|------|------|---------|--------------|
| `VALIDATION` | 400 | Schema validation failed | Show field errors |
| `CREDENTIAL_INVALID` | 401 | Wrong phone/password | Show error message |
| `TOKEN_INVALID` | 401 | Token expired/invalid | Refresh or redirect to login |
| `FORBIDDEN` | 403 | No permission | Show 403 page |
| `LEVEL_TOO_LOW` | 403 | Level requirement not met | Show level requirement |
| `USER_SUSPENDED` | 403 | Account suspended | Show suspension notice |
| `NOT_FOUND` | 404 | Resource not found | Show 404 page |
| `DUPLICATE_REGISTRATION` | 409 | Already registered | Disable register button |
| `DUPLICATE_APPLICATION` | 409 | Already applied | Show application status |
| `ACTIVITY_FULL` | 409 | No spots left | Show "full" state |
| `REGISTRATION_CLOSED` | 409 | Registration closed | Show closed state |
| `DEADLINE_PASSED` | 409 | Past deadline | Show deadline passed |
| `INVALID_STATE_TRANSITION` | 409 | Illegal state change | Refresh data |
| `INSUFFICIENT_POINTS` | 409 | Not enough points | Show deficit amount |
| `OUT_OF_STOCK` | 409 | No stock | Show "sold out" |
| `ALREADY_CHECKED_IN` | 409 | Already checked in today | Disable check-in |
| `RATE_LIMITED` | 429 | Too many requests | Show cooldown |
| `INTERNAL` | 500 | Server error | Show generic error + retry |

---

## 4. Conventions

- **Idempotency**: Lifecycle and points-issuance endpoints support `Idempotency-Key` header
- **Optimistic locking**: Registration approval and reward redemption use conditional updates; 409 on conflict
- **Pagination**: Default `page=1, pageSize=20`, max `pageSize=100`
- **Sorting**: Lists default `created_at DESC`; activities support `hot` (registration ratio) and `new`
- **File upload**: Multipart, max 5MB, JPG/PNG/WebP only
