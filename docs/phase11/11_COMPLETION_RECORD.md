# Phase 11 — Completion Record

**Phase:** 11 — Media / Cloudinary signing  
**Completed:** 2026-09-07  

---

## Checklist

### 11.1 Signing
- [x] Cloudinary SDK config from env (`cloudinary` package)
- [x] `POST /api/v1/media/sign` for admin (`items` | `banners` | `branding`)
- [x] Same route for customer (`chat` | `custom_requests`) with tighter max size
- [x] Reject unsigned public presets (`UNSIGNED_PRESET_FORBIDDEN`)

### 11.2 Conventions
- [x] Folder naming: `clients/<CLIENT_SLUG>/(items|chat|branding)`
- [x] Documented MIME + max size via `GET /api/v1/media/policy` + this record

### 11.3 Gate
- [x] Signed params verified (SHA-1 matches Cloudinary algorithm; live upload needs real Cloudinary account)
- [x] URL stored on item via Phase 10 `POST /items`

---

## Upload policy

| Actor | Purposes | Folder suffix | Max size | MIME |
|---|---|---|---|---|
| Admin | `items`, `banners`, `branding` | `items` / `branding` | 10 MB | jpeg, png, webp, heic/heif |
| Customer | `chat`, `custom_requests` | `chat` | 5 MB | same |

- Client uploads **directly to Cloudinary** using returned `signature`, `timestamp`, `apiKey`, `folder`.
- Production boot requires `CLOUDINARY_*` secrets.
- Never pass `uploadPreset` / `unsigned` to `/media/sign`.

## Key paths

| Path | Role |
|---|---|
| `src/modules/media/media.routes.ts` | `/media/sign`, `/media/policy` |
| `src/modules/media/media.service.ts` | Signature generation |
| `src/modules/media/media.policy.ts` | MIME / size / purpose map |
| `src/scripts/verifyMedia.ts` | Phase 11 gate |

## Verify

```bash
npm run verify:media -w @jwellers/api
```

## Deferred

- Live Cloudinary upload from Postman against real Demo cloud — needs Demo Cloudinary account (Phase 01 deferred vendor accounts)

## Next

**Phase 12 — Wishlist, enquiries, custom requests API**
