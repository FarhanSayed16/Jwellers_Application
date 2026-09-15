# Phase 12 — Completion Record

**Phase:** 12 — Wishlist, enquiries, custom requests API  
**Completed:** 2026-09-07  

---

## Checklist

### 12.1 Wishlist
- [x] `GET/POST /wishlist`, `DELETE /wishlist/:itemId` (customer)
- [x] Unique customer+item; add/remove idempotent

### 12.2 Enquiries
- [x] `POST /enquiries` (customer)
- [x] `GET /enquiries/me`
- [x] `GET /admin/enquiries`
- [x] `PATCH /admin/enquiries/:id` (status, assign)

### 12.3 Custom requests (flag)
- [x] CRUD-lite behind `FEATURE_CUSTOM_REQUESTS` / `requireFeature('customRequests')`
- [x] `referenceImageUrls` supported

### 12.4 Offers API (flag)
- [x] Public `GET /offers` (active + in date window)
- [x] Admin CRUD (`/admin/offers`)

### 12.5 Gate
- [x] Enquiry appears in admin list after customer POST
- [x] Wishlist toggle idempotent

---

## Key paths

| Path | Role |
|---|---|
| `src/modules/wishlist/` | Wishlist |
| `src/modules/enquiries/` | Enquiries |
| `src/modules/customRequests/` | Custom requests |
| `src/modules/offers/` | Offers |
| `src/scripts/verifyLeads.ts` | Phase 12 gate |

## Verify

```bash
npm run verify:leads -w @jwellers/api
```

## Next

**Phase 13 — Admin web — shell, auth, dashboard**
