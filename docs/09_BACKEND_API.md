# 09 — Backend API (Express) Implementation Plan

**Source of truth for:** API folder layout, middleware, route catalog, request/response shapes, errors.  
**Stack:** Node.js · Express · TypeScript · Mongoose  
**Related:** [02](./02_AUTH_AND_SECURITY.md) · [03](./03_DATA_MODEL.md) · [04](./04_FEATURES_AND_MODULES.md) · [13](./13_END_TO_END_FLOWS.md)

---

## 1. Goals

- One API serves **Flutter app** and **Next.js admin**.
- Feature flags gate optional modules.
- Consistent JSON errors and pagination.
- No secrets in public responses.

---

## 2. Suggested folder structure

```
apps/api/
  src/
    index.ts                 # bootstrap listen
    app.ts                   # express app + middleware
    config/
      env.ts                 # zod-validated env
      features.ts            # feature flag helpers
    db/
      connection.ts
      models/                # one file per collection (see 03)
    middleware/
      auth.ts                # requireCustomer / requireAdmin / requireOwner
      validate.ts            # zod request validation
      errorHandler.ts
      requestId.ts
      rateLimit.ts
      featureFlag.ts         # requireFeature('CHAT')
    modules/
      auth/
      config/
      rates/
      catalog/               # categories + items
      media/
      wishlist/
      enquiries/
      customRequests/
      offers/
      chat/
      devices/
      invoices/              # flagged
      payments/              # flagged
      adminUsers/
      audit/
    utils/
      otp.ts
      jwt.ts
      phone.ts
      cloudinary.ts
      pagination.ts
    scripts/
      seedOwner.ts
      migrate.ts
  .env.example
  package.json
  tsconfig.json
```

---

## 3. Base URL & versioning

| Item | Value |
|---|---|
| Base | `https://<client>.onrender.com/api/v1` |
| Health (no version ok) | `GET /health` |
| Versioning | URL prefix `/api/v1`; bump only on breaking changes |

Flutter flavor + admin env each store `API_BASE_URL`.

---

## 4. Cross-cutting conventions

### 4.1 Success response

```json
{
  "success": true,
  "data": { },
  "meta": { "requestId": "…", "pagination": { "nextCursor": null, "hasMore": false } }
}
```

List endpoints may return `data: []` with `meta.pagination`.

### 4.2 Error response

```json
{
  "success": false,
  "error": {
    "code": "OTP_RATE_LIMITED",
    "message": "Too many OTP requests. Try again later.",
    "details": {}
  },
  "meta": { "requestId": "…" }
}
```

| HTTP | When |
|---|---|
| 400 | Validation |
| 401 | Missing/invalid token |
| 403 | Role / feature flag forbidden |
| 404 | Not found |
| 409 | Conflict (duplicate SKU) |
| 429 | Rate limited |
| 500 | Unexpected |

### 4.3 Pagination

Cursor-based preferred for chat/messages; offset OK for admin tables.

```
?limit=20&cursor=<opaque>
```

### 4.4 Auth header

```
Authorization: Bearer <access_token>
```

Admin may alternatively use httpOnly cookie `admin_access` — pick **one** for admin and document in [10](./10_ADMIN_WEB_PAGES.md). Recommendation: **Bearer in memory + refresh cookie** or both Bearer for simplicity in MVP (store access in memory, refresh in httpOnly).

### 4.5 Middleware order

1. `requestId`  
2. `helmet` / CORS  
3. `express.json`  
4. `rateLimit` (global light)  
5. route-specific validate → auth → featureFlag → handler  
6. `errorHandler`

---

## 5. Env validation (required keys)

See [02](./02_AUTH_AND_SECURITY.md) §14. Fail fast on boot if missing in production:

`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `OTP_PEPPER`, `MSG91_*`, `CLOUDINARY_*`, `ADMIN_CORS_ORIGIN`, feature flags.

---

## 6. Route catalog

Legend: **P** = public · **C** = customer JWT · **A** = admin JWT · **O** = owner only · **F:** = feature flag

### 6.1 System & config

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | P | liveness |
| GET | `/ready` | P | DB connected |
| GET | `/config/public` | P | shop name, logo, themes, contact, defaults |
| GET | `/config/features` | P | boolean flags + public Razorpay key id if any |

### 6.2 Auth — customer

| Method | Path | Auth | Body / notes |
|---|---|---|---|
| POST | `/auth/customer/otp/request` | P | `{ phone }` + rate limits |
| POST | `/auth/customer/otp/verify` | P | `{ phone, otp }` → `{ accessToken, refreshToken, customer }` |
| POST | `/auth/customer/token/refresh` | P | `{ refreshToken }` |
| POST | `/auth/customer/logout` | C | revoke session |
| GET | `/auth/customer/me` | C | profile |
| PATCH | `/auth/customer/me` | C | `{ name }` |
| DELETE | `/auth/customer/me` | C | account deletion flow |

### 6.3 Auth — admin

| Method | Path | Auth | Body / notes |
|---|---|---|---|
| POST | `/auth/admin/login` | P | `{ emailOrPhone, password }` |
| POST | `/auth/admin/token/refresh` | P | refresh |
| POST | `/auth/admin/logout` | A | revoke |
| GET | `/auth/admin/me` | A | profile + role |
| POST | `/auth/admin/password/forgot` | P | owner phone/email |
| POST | `/auth/admin/password/reset` | P | `{ token, newPassword }` |

### 6.4 Rates

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/rates/latest` | P | latest row |
| GET | `/rates/history` | P | `?from&to&limit` |
| POST | `/rates` | A | create new rate snapshot |
| POST | `/rates/notify` | A | trigger FCM “rates updated” |

### 6.5 Catalog — categories

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/categories` | P | tree or flat `?parentId=` |
| GET | `/categories/:id` | P | |
| POST | `/categories` | A | |
| PATCH | `/categories/:id` | A | |
| DELETE | `/categories/:id` | A | soft delete |

### 6.6 Catalog — items

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/items` | P | filters: categoryId, subcategoryId, q, purity, metal, isNewArrival, isFeatured, status=active |
| GET | `/items/:id` | P | increments viewCount optionally |
| GET | `/items/sku/:sku` | P | for QR / deep link |
| POST | `/items` | A | |
| PATCH | `/items/:id` | A | |
| DELETE | `/items/:id` | A | soft delete |
| POST | `/items/:id/restore` | A | |
| POST | `/items/import` | A | CSV bulk (Month 3–4) |

### 6.7 Media

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/media/sign` | A (or C for chat attach) | Cloudinary signed params `{ folder, resourceType }` |

### 6.8 Wishlist

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/wishlist` | C | populated items |
| POST | `/wishlist` | C | `{ itemId }` |
| DELETE | `/wishlist/:itemId` | C | |

### 6.9 Enquiries & custom requests

| Method | Path | Auth | F | Description |
|---|---|---|---|---|
| POST | `/enquiries` | C | | `{ itemId?, message, channel? }` |
| GET | `/enquiries/me` | C | | customer’s list |
| GET | `/admin/enquiries` | A | | inbox |
| PATCH | `/admin/enquiries/:id` | A | | status, assign |
| POST | `/custom-requests` | C | CUSTOM_REQUESTS | |
| GET | `/custom-requests/me` | C | | |
| GET | `/admin/custom-requests` | A | | |
| PATCH | `/admin/custom-requests/:id` | A | | |

### 6.10 Offers

| Method | Path | Auth | F:OFFERS | Description |
|---|---|---|---|---|
| GET | `/offers` | P | active & in date range |
| CRUD | `/admin/offers` | A | full management |

### 6.11 Chat — F:CHAT

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/chat/threads` | C | `{ itemId?, subject? }` |
| GET | `/chat/threads` | C | my threads |
| GET | `/chat/threads/:id/messages` | C/A | must be participant / staff |
| POST | `/chat/threads/:id/messages` | C/A | `{ body?, attachmentUrls[], clientMessageId }` |
| POST | `/chat/threads/:id/read` | C/A | |
| PATCH | `/chat/threads/:id` | A | `{ status }` |
| GET | `/admin/chat/threads` | A | inbox `?status=` |

### 6.12 Devices / push

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/devices` | C | `{ fcmToken, platform }` |
| DELETE | `/devices/:token` | C | |

### 6.13 Admin users — O for mutate

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/admin/users` | O | |
| POST | `/admin/users` | O | invite staff |
| PATCH | `/admin/users/:id` | O | activate/permissions |
| PATCH | `/admin/shop-config` | O | branding tokens etc. |
| GET | `/admin/shop-config` | A | |
| GET | `/admin/dashboard` | A | counts |

### 6.14 Invoices — F:DIGITAL_BILLING

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/admin/invoices` | A | create + generate PDF |
| GET | `/admin/invoices` | A | |
| GET | `/invoices/:id` | C/A | if owner customer or admin |

### 6.15 Payments — F:RAZORPAY

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/payments/orders` | C | create Razorpay order |
| POST | `/payments/webhook` | P | signature verify (raw body) |
| GET | `/admin/payments` | A | |

### 6.16 Calculator helper (optional)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/calculator/quote` | P | `{ purity, weightGrams, makingType, makingValue, gstPercent? }` → breakup using latest rates |

Keeps Flutter and admin math identical.

---

## 7. Feature-flag middleware

```ts
// Pseudocode
requireFeature('CHAT') // reads process.env.FEATURE_CHAT === 'true'
```

If false → `403 FEATURE_DISABLED`.

---

## 8. Background jobs (MVP-light)

| Job | Trigger | Action |
|---|---|---|
| Rate notify | `POST /rates/notify` | Fan-out FCM to active devices |
| New arrival notify | Admin action or item flag | FCM |
| OTP cleanup | TTL index on `otp_challenges` | automatic |
| Session cleanup | TTL / cron weekly | delete expired |

No Redis required for MVP; add later for OTP store if needed.

---

## 9. Testing checklist (API)

- [ ] OTP rate limit returns 429  
- [ ] Customer token cannot hit `/admin/*`  
- [ ] Staff cannot PATCH shop branding  
- [ ] Soft-deleted items excluded from public list  
- [ ] Chat customer cannot read another’s thread  
- [ ] `/config/features` never leaks secrets  
- [ ] Duplicate SKU → 409  

---

## 10. Implementation order

1. env + db + health + config  
2. auth admin + customer  
3. rates + catalog + media  
4. wishlist + enquiries  
5. chat  
6. devices + notify  
7. flagged modules as sold  

Wire exact sequences in [13_END_TO_END_FLOWS](./13_END_TO_END_FLOWS.md).
