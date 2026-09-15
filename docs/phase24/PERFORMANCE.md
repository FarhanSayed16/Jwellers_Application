# Phase 24 — Performance notes

## Pagination

| Resource | Mechanism | Caps |
|---|---|---|
| Catalog items | `skip` + `limit` query | limit 1–100 (default 50) |
| Chat messages | cursor (`nextCursor` / `hasMore`) | see chat service |
| Admin threads | list endpoints with status filters | |

Response `meta.pagination` supports `{ skip, limit, total, hasMore }` and/or `{ nextCursor, hasMore }`.

## Cloudinary thumbs

- API helper: `utils/cloudinaryUrl.ts` → `cloudinaryThumbUrl(url, { width })`.
- Mobile: `AppCachedImage(thumb: true)` rewrites `res.cloudinary.com/.../upload/` URLs to `c_limit,w_*,q_auto,f_auto` (used on `ItemCard`).
- Non-Cloudinary URLs unchanged.

## Indexes

- Run after schema changes: `npm run migrate -w @jwellers/api` (syncIndexes for all registered models).
- Under sample load before launch: confirm Atlas Metrics for scan warnings on items (sku, category, status), sessions, OTP challenges, chat messages.
- Dedicated DB per client — index cost does not cross clients.

## Smoke

```bash
# API must be running
npm run smoke -w @jwellers/api
SMOKE_BASE_URL=https://<deployed-api> SMOKE_ADMIN_EMAIL=... SMOKE_ADMIN_PASSWORD=... npm run smoke -w @jwellers/api
```

## Readiness performance checklist (2026-09-12)

- [x] Catalog list uses pagination caps (see above)  
- [x] Mobile Cloudinary thumbs via `AppCachedImage(thumb: true)`  
- [x] Admin Next.js 15 production build (App Router static legal pages)  
- [x] API `/health` / `/ready` for uptime probes during deploy  
- [x] Optional admin Lighthouse: run against hosted admin after deploy (manual pre-Play)  
- [x] Broken legal links check: `npm run check:legal-links -w @jwellers/admin` (admin running)  
