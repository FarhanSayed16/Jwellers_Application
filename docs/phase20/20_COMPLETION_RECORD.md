# Phase 20 — Completion Record

**Phase:** 20 — Chat Phase A — API + Admin + Mobile  
**Completed:** 2026-09-07  

---

## Checklist

### 20.1 API
- [x] `POST/GET /chat/threads` (customer) · reuse open thread by customer+item
- [x] `GET/POST /chat/threads/:id/messages` · `clientMessageId` idempotency
- [x] `POST /chat/threads/:id/read` · unread counters
- [x] `GET /admin/chat/threads` · `PATCH /chat/threads/:id` status
- [x] AuthZ + 30 msg/min rate limit + `requireFeature('chat')`

### 20.2 Admin
- [x] `/chat` + `/chat/[threadId]` inbox pane
- [x] Composer · HTTPS attachment URL · poll 5–8s · status select

### 20.3 Mobile
- [x] Chat tab (flag) · list + unread · conversation · item “Chat” creates/opens thread
- [x] Attachment URL field (gallery picker deferred)

### 20.4 Gate
- [x] `npm run verify:chat` — two-way, cross-customer 403, feature off 403
- [x] Tab hidden when `FEATURE_CHAT=false` (Phase 16 test)

---

## Verify

```bash
npm run verify:chat -w @jwellers/api
npm run build -w @jwellers/admin
cd apps/mobile && flutter analyze && flutter test
```

## Deferred

| Item | Target |
|---|---|
| Image picker → `POST /media/sign` purpose `chat` | Demo Cloudinary / before Phase 25 |
| FCM chat nudge | Phase 21 |

## Next

**Phase 21 — Push notifications (FCM)**
