# Phase 06 — Completion Record

**Phase:** 06 — Public config & feature flags  
**Completed:** 2026-09-07  

---

## Checklist

### 06.1 Endpoints
- [x] `GET /api/v1/config/public` — shop/themes/contact/defaults (DB or Demo file fallback)
- [x] `GET /api/v1/config/features` — booleans + `razorpayKeyId` only when payments on
- [x] `GET /api/v1/admin/shop-config` — locked with `401 AUTH_REQUIRED` until Phase 07
- [x] `PATCH /api/v1/admin/shop-config` — same auth stub; validation ready for Phase 07

### 06.2 Feature middleware
- [x] `requireFeature(key)` — `src/middleware/featureFlag.ts`
- [x] 403 `FEATURE_DISABLED` when off (wired; proven on via `/api/v1/__debug/require-chat`)

### 06.3 Gate
- [x] Public config returns Demo tokens (`source: file_fallback` without Mongo)
- [x] Features JSON matches env flags
- [x] Secrets never appear in public responses (banned-key scan + manual review)

---

## Key paths

| Path | Role |
|---|---|
| `src/modules/config/config.service.ts` | Public mapping + secret guard + file fallback |
| `src/modules/config/config.routes.ts` | Public + admin stub routes |
| `src/middleware/authStub.ts` | Phase 07 placeholder |
| `src/middleware/featureFlag.ts` | `requireFeature` |

## Verify

```bash
curl http://localhost:4000/api/v1/config/public
curl http://localhost:4000/api/v1/config/features
curl http://localhost:4000/api/v1/admin/shop-config   # 401
```

## Next

**Phase 07 — Admin authentication**
