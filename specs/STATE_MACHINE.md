# STATE_MACHINE.md · FellowX 状态机

> 格式：`State —[Event / Guard]→ Next State`。事件标注触发角色与守卫条件。
> 非法转换一律拒绝并返回 `409 INVALID_STATE_TRANSITION`。
> 所有状态变更写 `audit_logs`（后台操作）或对应业务日志，并按需发 `notifications`。

---

## 1. Activity（活动）状态机

**状态集**：`DRAFT` `PENDING_REVIEW` `PUBLISHED` `REGISTRATION_OPEN` `IN_PROGRESS` `ENDED` `REJECTED` `CANCELLED`

| 当前状态 | 事件 | 触发角色 | 守卫 | 目标状态 |
|---|---|---|---|---|
| (none) | createDraft | Launcher | title 非空 | DRAFT |
| DRAFT | update | Launcher(own) | — | DRAFT |
| DRAFT | submitReview | Launcher(own) | 全量严格校验通过 | PENDING_REVIEW |
| DRAFT | delete | Launcher(own) | — | (deleted) |
| DRAFT | cancel | Launcher(own) | — | CANCELLED |
| PENDING_REVIEW | approve | Admin | — | PUBLISHED |
| PENDING_REVIEW | reject | Admin | reject_reason 必填 | REJECTED |
| PENDING_REVIEW | cancel | Launcher(own) | — | CANCELLED |
| REJECTED | update | Launcher(own) | — | REJECTED |
| REJECTED | resubmit | Launcher(own) | 全量校验通过 | PENDING_REVIEW |
| REJECTED | cancel | Launcher(own) | — | CANCELLED |
| PUBLISHED | openRegistration | Launcher(own) | now < registration_deadline | REGISTRATION_OPEN |
| PUBLISHED | cancel | Launcher(own) | — | CANCELLED |
| REGISTRATION_OPEN | start | Launcher(own) | — | IN_PROGRESS |
| REGISTRATION_OPEN | cancel | Launcher(own) | 通知已报名者 | CANCELLED |
| REGISTRATION_OPEN | autoStart | System | now ≥ start_time | IN_PROGRESS |
| IN_PROGRESS | end | Launcher(own) | 触发发分流程 | ENDED |
| IN_PROGRESS | autoEnd | System | now ≥ end_time | ENDED |
| IN_PROGRESS | cancel | Launcher(own) | 通知已报名者 | CANCELLED |
| ENDED | — | — | 终态 | — |
| CANCELLED | — | — | 终态 | — |

**副作用**
- `approve` → `published_at=now`，发 `ACTIVITY_REVIEW`(通过) 通知。
- `reject` → 发 `ACTIVITY_REVIEW`(驳回 + 原因) 通知。
- `openRegistration` → 报名通道开启。
- `start` → 报名通道关闭（拒绝新报名）。
- `end` → **对所有 APPROVED 报名者发分**（ACTIVITY_JOIN +120 growth、ACTIVITY_JOIN_E +50 exchange），发起人 ACTIVITY_LAUNCH +300 growth；幂等：以 activity_id 去重防重复发分。
- `cancel`（有报名者时）→ 批量发 `ACTIVITY_CANCELLED` 通知；不发分，不扣分。

**自动流转**：`autoStart` / `autoEnd` 由定时任务（每分钟）扫描时间窗驱动；发起人也可手动提前 `start` / `end`。二者择一，需幂等。

```
DRAFT ─submit→ PENDING_REVIEW ─approve→ PUBLISHED ─open→ REGISTRATION_OPEN ─start→ IN_PROGRESS ─end→ ENDED
  │                   │ reject              │ cancel          │ cancel             │ cancel
  └─cancel→CANCELLED  ▼                     ▼                 ▼                    ▼
                   REJECTED ─resubmit→ (PENDING_REVIEW)     CANCELLED (终态)
```

---

## 2. Registration（报名）状态机

**状态集**：`PENDING` `APPROVED` `REJECTED` `CANCELLED`

| 当前状态 | 事件 | 触发角色 | 守卫 | 目标状态 |
|---|---|---|---|---|
| (none) | register | Member/Launcher | 报名前置条件全满足（见 BR-RG） | PENDING |
| PENDING | approve | Launcher(own活动) | 乐观锁占名额成功 | APPROVED |
| PENDING | reject | Launcher(own活动) | reject_reason 必填 | REJECTED |
| PENDING | cancel | Member(own) | 不扣分 | CANCELLED |
| APPROVED | cancel | Member(own) | **扣 50 成长分**，释放名额 | CANCELLED |
| APPROVED | activityEnded | System | 发分（随活动 end） | APPROVED(保持) |
| REJECTED | — | — | 终态 | — |
| CANCELLED | — | — | 终态 | — |

**副作用**
- `approve` → `approved_count++`（乐观锁，超额则失败转「名额已满」）；发 `REGISTRATION_REVIEW`(通过) 通知。
- `reject` → 发 `REGISTRATION_REVIEW`(拒绝 + 原因) 通知。
- `cancel`(from APPROVED) → `approved_count--`（释放名额）；写 `CANCEL_APPROVED` 流水（-50 growth）。
- `cancel`(from PENDING) → 无积分影响。

---

## 3. LauncherApplication（发起人申请）状态机

**状态集**：`PENDING` `APPROVED` `REJECTED`

| 当前状态 | 事件 | 触发角色 | 守卫 | 目标状态 |
|---|---|---|---|---|
| (none) | apply | Member | level 可申请 且 无 PENDING 申请 | PENDING |
| PENDING | approve | Admin | — | APPROVED |
| PENDING | reject | Admin | reject_reason 必填 | REJECTED |
| REJECTED | reapply | Member | 同 apply 守卫 | PENDING(新记录) |
| APPROVED | — | — | 终态 | — |

**副作用**
- `approve` → `users.role` 升级为 `LAUNCHER`；发 `LAUNCHER_REVIEW`(通过) 通知。
- `reject` → 发 `LAUNCHER_REVIEW`(驳回 + 原因) 通知；用户可重新申请（新建记录）。

---

## 4. RewardOrder（兑换订单）状态机

**状态集**：`PENDING` `COMPLETED` `CANCELLED` `FULFILLED`

| 当前状态 | 事件 | 触发角色 | 守卫 | 目标状态 |
|---|---|---|---|---|
| (none) | redeem(虚拟) | Member | 兑换前置满足，单事务扣分扣库存 | COMPLETED |
| (none) | redeem(实物) | Member | 同上 | PENDING |
| PENDING | fulfill | Admin | 填写发放信息 | FULFILLED |
| PENDING | cancel | Admin | 退还积分 + 回补库存 | CANCELLED |
| COMPLETED | — | — | 终态（虚拟即时核销） | — |
| FULFILLED | — | — | 终态 | — |
| CANCELLED | — | — | 终态 | — |

**副作用**
- `redeem` → 单事务：`exchange_points -= cost`（CHECK≥0）、`stock -= 1`（CHECK≥0）、建订单、写 point_log(ref=reward)。
- `cancel` → 退 `exchange_points += cost`、`stock += 1`、写补偿流水。

> 本期最小实现：所有福利按虚拟即时核销（直接 COMPLETED）。实物 PENDING→FULFILLED 为扩展项，状态机已预留。

---

## 5. User.status（账号状态）

| 当前状态 | 事件 | 触发角色 | 目标状态 |
|---|---|---|---|
| ACTIVE | suspend | Admin | SUSPENDED |
| SUSPENDED | unsuspend | Admin | ACTIVE |
| ACTIVE | requestDeactivate | Member(own) | DEACTIVATING（deactivate_at=now+30d） |
| DEACTIVATING | restore | Member/客服 | ACTIVE |
| DEACTIVATING | purge | System(到期) | DELETED |

**守卫**：`SUSPENDED` 与 `DEACTIVATING` 用户不可报名/兑换/申请/发起。`DELETED` 为终态（数据按合规匿名化保留）。
