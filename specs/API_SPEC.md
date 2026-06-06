# API_SPEC.md · FellowX RESTful API

> Base URL：`/api` · 风格：RESTful · 认证：`Authorization: Bearer <accessToken>`（JWT）
> 统一响应包：`{ "code": 0, "message": "ok", "data": ... }`；分页：`{ items, total, page, pageSize }`
> 统一错误：HTTP 状态码 + `{ code, message }`；`code` 为业务错误码（见 §9）。
> 时间字段 ISO 8601（UTC）。所有写接口在服务端做权限 + 所有权 + 业务守卫校验。
> 权限标注引用 PERMISSION_MATRIX.md 的角色与守卫脚注。

---

## 1. Auth · 认证

### POST /auth/register
注册并登录。
- **Permission**：Public
- **Request**：`{ phone, password, name, smsCode }`
- **Response 201**：`{ accessToken, refreshToken, user }`
- **Errors**：`PHONE_EXISTS`(409)、`SMS_INVALID`(400)、`VALIDATION`(400)

### POST /auth/login
- **Permission**：Public
- **Request**：`{ phone, password }` 或 `{ phone, smsCode }`
- **Response 200**：`{ accessToken, refreshToken, user }`
- **Errors**：`CREDENTIAL_INVALID`(401)、`USER_SUSPENDED`(403)

### POST /auth/refresh → `{ refreshToken }` → `{ accessToken }`。`TOKEN_INVALID`(401)
### POST /auth/logout → 204。失效当前/刷新令牌。
### POST /auth/sms-code → `{ phone, scene }` → 204。发送验证码，限频。

---

## 2. User · 用户与资料

### GET /members/me
- **Permission**：已登录（own）
- **Response**：`{ id, memberNo, name, avatarUrl, gender, birthday, email, phone(脱敏), role, status, level, growthPoints, exchangePoints, participationDays, streakDays, profileCompleted }`
- **Errors**：`TOKEN_INVALID`(401)

### PUT /members/me
- **Permission**：已登录（own）
- **Request**：`{ name?, gender?, birthday?, email?, avatarUrl? }`
- **Response**：更新后的 user
- **Errors**：`VALIDATION`(400 邮箱/生日/昵称)
- **规则**：BR-AN-01/02/03；首次完善触发 +5 成长分

### DELETE /members/me （申请注销）
- **Permission**：已登录（own）
- **Response 200**：`{ deactivateAt }`
- **规则**：BR-AN-04，置 DEACTIVATING

### POST /upload/avatar · POST /upload/image
- **Request**：multipart `file`
- **Response**：`{ url }`
- **Errors**：`FILE_TOO_LARGE`(413)、`FILE_TYPE`(415)
- **规则**：BR-AN-05

---

## 3. Activity · 活动

### GET /activities
活动广场（公开，仅返回 PUBLISHED 及之后状态）。
- **Permission**：Public
- **Query**：`category? state? keyword? page pageSize sort(hot|new)`
- **Response**：`{ items:[ActivityCard], total, page, pageSize }`

### GET /activities/{id}
- **Permission**：Public（草稿/待审仅 own Launcher 或 Admin）
- **Response**：完整 Activity（含 content 富文本、报名进度、状态时间线所需字段）
- **Errors**：`NOT_FOUND`(404)、`FORBIDDEN`(403 非公开态)

### POST /activities （创建草稿）
- **Permission**：Launcher
- **Request**：`{ title, category?, summary?, location?, content?, coverImageUrl?, startTime?, endTime?, registrationDeadline?, maxParticipants?, minLevelId? }`
- **Response 201**：Activity（state=DRAFT）
- **规则**：BR-AC-01/02（宽松校验）

### PUT /activities/{id} （编辑草稿/驳回件）
- **Permission**：Launcher(own)，仅 DRAFT/REJECTED
- **Errors**：`INVALID_STATE_TRANSITION`(409)、`FORBIDDEN`(403 非本人)

### POST /activities/{id}/submit-review
- **Permission**：Launcher(own)，DRAFT/REJECTED → PENDING_REVIEW
- **规则**：BR-AC-02 全量校验；`VALIDATION`(400)

### POST /activities/{id}/lifecycle
统一生命周期操作端点（或拆分为子路径）。
- **Permission**：Launcher(own)
- **Request**：`{ action: "openRegistration"|"start"|"end"|"cancel" }`
- **Response**：更新后 Activity
- **Errors**：`INVALID_STATE_TRANSITION`(409)
- **副作用**：`end`→发分（BR-AC-06）；`cancel`→通知（BR-AC-07）

### DELETE /activities/{id}
- **Permission**：Launcher(own)，仅 DRAFT

### POST /admin/activities/{id}/review
- **Permission**：Admin
- **Request**：`{ approved: true }` 或 `{ approved: false, rejectReason }`
- **规则**：STATE_MACHINE §1；驳回原因必填（BR-RV-01）

### GET /launcher/activities
- **Permission**：Launcher(own)
- **Query**：`state? page pageSize`

---

## 4. Registration · 报名

### POST /activities/{id}/register
- **Permission**：Member/Launcher，守卫脚注⁵
- **Request**：`{ contact?, note? }`
- **Response 201**：Registration（PENDING）
- **Errors**：`DUPLICATE_REGISTRATION`(409)、`LEVEL_TOO_LOW`(403)、`ACTIVITY_FULL`(409)、`REGISTRATION_CLOSED`(409)、`DEADLINE_PASSED`(409)
- **规则**：BR-RG-01/03/04

### GET /registrations/mine
- **Permission**：已登录（own）
- **Query**：`state? page pageSize`

### POST /registrations/{id}/cancel
- **Permission**：Member(own)，仅 PENDING/APPROVED
- **Response**：更新后 Registration（CANCELLED）
- **规则**：BR-RG-06（APPROVED 扣 50 成长分、释放名额）

### GET /activities/{id}/registrations
- **Permission**：Launcher(own活动) / Admin
- **Query**：`state? keyword? page pageSize`

### POST /registrations/{id}/review
- **Permission**：Launcher(own活动)
- **Request**：`{ approved:true }` 或 `{ approved:false, rejectReason }`
- **Errors**：`ACTIVITY_FULL`(409 审批时名额已满)、`VALIDATION`(400 缺原因)
- **规则**：BR-RG-02/05（乐观锁占名额）

---

## 5. Point · 积分

### GET /points/summary → `{ growthPoints, exchangePoints, level, nextLevel, progress }`（own）
### GET /points/transactions
- **Permission**：已登录（own）
- **Query**：`pointsType?(GROWTH|EXCHANGE) page pageSize`
- **Response**：`{ items:[{ id, pointsType, amount, balanceAfter, title, ruleCode, createdAt }], total }`
### POST /points/daily-check-in → 200 `{ awarded:10 }`。`ALREADY_CHECKED_IN`(409)。规则 BR-PT-05
### GET /levels → 等级体系（Public）

---

## 6. Reward · 福利与兑换

### GET /rewards
- **Permission**：Public（仅 ON_SHELF）
- **Query**：`category? page pageSize`
### POST /rewards/{id}/redeem
- **Permission**：Member/Launcher，守卫脚注⁶
- **Response 201**：RewardOrder
- **Errors**：`INSUFFICIENT_POINTS`(409)、`OUT_OF_STOCK`(409)、`REWARD_OFF_SHELF`(409)
- **规则**：BR-RW-01/02
### GET /orders/mine → 我的兑换记录（own）

---

## 7. Launcher Application · 发起人申请

### POST /launchers/apply
- **Permission**：Member，守卫脚注⁸
- **Request**：`{ description }`（≤500）
- **Response 201**：Application（PENDING）
- **Errors**：`DUPLICATE_APPLICATION`(409)、`LEVEL_TOO_LOW`(403)
### GET /launchers/apply/mine → 当前申请状态（own）
### GET /admin/launchers
- **Permission**：Admin · Query `status? page pageSize`
### POST /admin/launchers/{id}/review
- **Permission**：Admin · `{ approved }` / `{ approved:false, rejectReason }`
- **副作用**：通过→role 升级 LAUNCHER（STATE_MACHINE §3）

---

## 8. Admin · 后台

| Method · Path | 说明 | Permission |
|---|---|---|
| GET /admin/dashboard | 仪表盘汇总（会员数/活动/积分/兑换/待办/趋势/等级分布） | Admin |
| GET /admin/members | 会员列表（keyword/level/status 筛选分页） | Admin |
| GET /admin/members/{id} | 会员详情 | Admin |
| PUT /admin/members/{id}/status | `{ status: ACTIVE\|SUSPENDED }` 封禁/解封 | Admin |
| POST /admin/points/adjust | `{ memberId, pointsType, amount, reason }` 手动调分 | Admin |
| GET /admin/points/transactions | 全量流水（member/type/date 筛选） | Admin |
| GET /admin/point-rules | 积分规则列表 | Admin |
| PUT /admin/point-rules/{code} | `{ amount?, enabled? }` 调值/启停（不可删） | Admin |
| GET /admin/rewards · POST /admin/rewards · PUT /admin/rewards/{id} | 福利增改 | Admin |
| PUT /admin/rewards/{id}/status | 上架/下架 | Admin |
| GET /admin/levels · PUT /admin/levels/{id} | 等级配置（阈值不回溯，BR-LV-03） | Admin |
| GET /admin/activities/review | 待审/已审活动 | Admin |
| GET /notifications · PUT /notifications/{id}/read · PUT /notifications/read-all | 通知 | 已登录(own) |

---

## 9. 错误码表

| code | HTTP | 含义 |
|---|---|---|
| VALIDATION | 400 | 参数/格式校验失败 |
| CREDENTIAL_INVALID | 401 | 账号或密码错误 |
| TOKEN_INVALID | 401 | 令牌失效/过期 |
| FORBIDDEN | 403 | 无权限/非所有者 |
| LEVEL_TOO_LOW | 403 | 等级不足 |
| USER_SUSPENDED | 403 | 账号被封禁 |
| NOT_FOUND | 404 | 资源不存在 |
| DUPLICATE_REGISTRATION | 409 | 重复报名 |
| DUPLICATE_APPLICATION | 409 | 重复发起人申请 |
| ACTIVITY_FULL | 409 | 名额已满 |
| REGISTRATION_CLOSED | 409 | 报名通道关闭 |
| DEADLINE_PASSED | 409 | 已过报名截止 |
| INVALID_STATE_TRANSITION | 409 | 非法状态流转 |
| INSUFFICIENT_POINTS | 409 | 积分不足 |
| OUT_OF_STOCK | 409 | 库存不足 |
| REWARD_OFF_SHELF | 409 | 福利已下架 |
| ALREADY_CHECKED_IN | 409 | 今日已签到 |
| FILE_TOO_LARGE / FILE_TYPE | 413/415 | 上传超限/类型不符 |
| RATE_LIMITED | 429 | 触发限频 |
| INTERNAL | 500 | 服务端错误 |

---

## 10. 约定

- **幂等**：生命周期与发分类接口需幂等（重复调用不重复发分）；建议写操作支持 `Idempotency-Key` 头。
- **乐观锁**：报名审批占名额、兑换扣库存均用条件更新，失败返回对应 409。
- **分页默认**：`page=1, pageSize=20`，上限 100。
- **排序**：列表默认按 `created_at desc`；活动广场支持 `hot`（registered 占比）/`new`。
