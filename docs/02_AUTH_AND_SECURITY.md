# 02 — Auth & Security

**Source of truth for:** authentication, authorization, tokens, OTP abuse control, secrets, uploads, isolation.  
**Related:** [03_DATA_MODEL](./03_DATA_MODEL.md) · [06_LEGAL_AND_COMPLIANCE](./06_LEGAL_AND_COMPLIANCE.md)

---

## 1. Goals

1. Customers log in with **phone OTP** (India retail norm).
2. Retailer staff log in to **admin** with a separate, stronger auth path.
3. Secrets never ship to the mobile app or public feature-config endpoint.
4. One client’s compromise cannot reach another (dedicated infra + per-instance secrets).
5. OTP and chat cannot become an unbounded SMS/cost or spam vector.

---

## 2. Actors & roles

| Actor | Surface | Auth method | Roles |
|---|---|---|---|
| Customer | Flutter app | Phone OTP → JWT | `customer` |
| Shop owner | Admin (Next.js) | Email/phone + password (or OTP) → JWT | `owner` |
| Staff | Admin | Same, invited by owner | `staff` (limited) |
| System | CI / scripts | Deploy keys / env only | n/a |

### Role permissions (admin)

| Action | owner | staff |
|---|---|---|
| Set rates | ✓ | ✓ (if granted) |
| Manage catalog / images | ✓ | ✓ |
| View / reply chat & enquiries | ✓ | ✓ |
| Branding & theme tokens | ✓ | ✗ |
| Feature flags / billing settings | ✓ | ✗ |
| Invite/revoke staff | ✓ | ✗ |
| View cost-sensitive keys | ✓ | ✗ |

MVP may ship with a single `owner` account; keep the role field in the schema from day one so staff invites do not require a migration later.

---

## 3. Customer auth flow (MSG91 OTP)

```
1. App POST /auth/customer/otp/request { phone }
2. API validates phone (E.164 / India 10-digit rules), applies rate limits
3. API stores hashed OTP + expiry in DB (or Redis if added later); sends SMS via MSG91
4. App POST /auth/customer/otp/verify { phone, otp }
5. On success: upsert customer, issue access + refresh tokens
6. App sends Authorization: Bearer <access_token> on protected routes
```

### OTP rules (required)

| Rule | Value (default; tunable per client via env) |
|---|---|
| OTP length | 6 digits |
| OTP TTL | 5–10 minutes |
| Max sends per phone / hour | 3 |
| Max sends per IP / hour | 10 |
| Max verify attempts per OTP | 5 then lock that challenge |
| Cooldown between sends | 45–60 seconds |
| Storage | Store **hash** of OTP only (e.g. SHA-256 with server pepper), never plaintext |
| Logging | Never log raw OTP or full tokens |

Failed/abusive traffic burns **the client’s** MSG91 balance — rate limits are a product requirement, not optional polish.

### Fallback

If a specific client refuses MSG91, Firebase Phone Auth may be swapped behind the same `/auth/customer/otp/*` interface. Default remains MSG91.

---

## 4. Admin auth flow

```
1. Owner bootstrap: create first owner during deploy (secure one-time script or seeded invite)
2. POST /auth/admin/login { emailOrPhone, password }
3. Password verified with bcrypt/argon2
4. Issue admin access + refresh JWTs with role claims
5. Optional later: admin OTP step-up for sensitive actions (branding, keys, staff)
```

### Password rules

- Min 10 characters; block common passwords
- bcrypt cost ≥ 12 (or argon2id)
- Lock account after N failed logins (e.g. 10 / 15 min)
- Password reset via time-limited token emailed/SMS’d to owner only

Do **not** reuse customer OTP tokens for admin sessions.

---

## 5. JWT & session design

| Token | Lifetime | Storage (mobile) | Storage (admin) |
|---|---|---|---|
| Access | 15–30 min | Secure storage (Keychain/Keystore via Flutter secure storage) | httpOnly secure cookie **or** memory + refresh |
| Refresh | 30–90 days | Secure storage | httpOnly secure cookie preferred |

### Token claims (minimum)

```json
{
  "sub": "<userId>",
  "role": "customer | owner | staff",
  "typ": "access | refresh",
  "sid": "<sessionId>"
}
```

### Rules

- Separate signing secrets for customer vs admin **or** strict `role` + audience (`aud`) checks on every route.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` are **per-client env** values (dedicated infra).
- Refresh token rotation: each use issues new refresh; old refresh revoked (store `session` / refresh jti in DB).
- Logout = revoke session server-side.
- Account delete / ban = revoke all sessions for that user.

Protected route middleware:

- Customer routes: require `role === customer`
- Admin routes: require `role ∈ {owner, staff}` + permission checks
- Never trust client-sent role fields in body

---

## 6. Public vs protected API surface

### Public (no auth)

- `GET /health`
- `GET /config/public` — shop name, logo, theme tokens, contact (non-secret)
- `GET /config/features` — boolean flags + public keys only (e.g. Razorpay **key id**)
- `GET /rates/latest` (optional: public for calculator marketing; or require auth — pick one and stick to it; **recommendation:** public latest rates for home screen performance)
- `GET /catalog/...` read endpoints for browsing (optional auth for personalization)
- `POST /auth/customer/otp/request`
- `POST /auth/customer/otp/verify`
- `POST /auth/admin/login`

### Auth required

- Wishlist, enquiries, custom requests
- Chat send/list
- Customer profile update
- All admin mutations (rates, catalog, branding, offers, staff)
- FCM token registration

### Server-only (never exposed)

- MSG91 auth key
- Cloudinary API secret
- Razorpay **secret**
- Mongo connection string
- JWT secrets
- Webhook signing secrets

---

## 7. Image upload security

1. Admin (authenticated) requests `POST /media/sign` → short-lived Cloudinary signed upload params.
2. Client uploads **directly to Cloudinary** with signature.
3. API stores returned secure URLs on item/banner documents after validation (allowed formats, max size).
4. Reject unsigned public upload presets in production.
5. Optional: Cloudinary upload preset restricted to image types; folder per client instance.

Watermarking (retailer logo on photos) can be Cloudinary transformation or pre-processed on upload — decide per client; store original + display derivative URLs.

---

## 8. Chat security (when module on)

See feature detail in [04](./04_FEATURES_AND_MODULES.md). Security rules here:

- Customers only read/write threads they own.
- Staff/owner can read all shop threads.
- Attachments go through same signed upload path; scan/limit MIME + size.
- Rate-limit messages per user (e.g. 30/min) to prevent spam.
- Do not put PII in FCM payloads beyond opaque IDs; fetch content via API after notification tap.
- Soft-delete messages; owners can moderate/hide.

---

## 9. Transport, CORS, headers

| Control | Requirement |
|---|---|
| HTTPS | Required everywhere in staging/production |
| CORS | Admin origin(s) + no `*` with credentials |
| Helmet / security headers | On Express by default |
| Body size limits | Tight defaults; higher only on upload-sign related routes if needed |
| Mongo injection | Mongoose only; avoid raw unsanitized queries |

---

## 10. Secrets & per-client isolation

Because each client is a separate Render + Atlas project:

- Unique `JWT_*` secrets per client
- Unique DB users/passwords per client
- Unique Cloudinary + MSG91 credentials per client
- Rotate secrets on staff offboarding / suspected leak
- `.env` only on host; never commit; provide `.env.example` with placeholders

Breach on Client A’s Render env does not yield Client B’s DB credentials **if** accounts stay separate (locked model).

---

## 11. Push notification security

- Register FCM device tokens on `POST /devices` (auth required); bind to `customerId`
- On logout / uninstall signal, deactivate tokens
- Admin-triggered broadcasts (rate update, offers) only via authenticated admin routes
- Prefer topic per client instance (each backend is already isolated) + optional user segments later

---

## 12. Payments (when `FEATURE_RAZORPAY_PAYMENTS=true`)

- Checkout order created **on server** with Razorpay secret
- Client receives order id + public key id only
- Payment verification webhook / server-side signature check before marking enquiry/booking paid
- Never trust client “payment success” alone

---

## 13. Audit & abuse monitoring (MVP-minimum)

Log (structured, no secrets):

- OTP request/verify outcomes (phone hashed or masked)
- Admin logins / failures
- Rate changes (who, old → new, timestamp)
- Permission-denied spikes

Retain logs per client hosting plan; owners may request export under AMC.

---

## 14. Env vars (security-related checklist)

```bash
NODE_ENV=production
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
OTP_PEPPER=
OTP_TTL_SECONDS=300
OTP_MAX_PER_PHONE_PER_HOUR=3
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=
MSG91_SENDER_ID=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
FCM_PROJECT_ID=          # or use Firebase Admin JSON via secret file
ADMIN_CORS_ORIGIN=
# Feature flags — see 04
FEATURE_CHAT=true
FEATURE_HALLMARK=false
FEATURE_DIGITAL_BILLING=false
FEATURE_RAZORPAY_PAYMENTS=false
FEATURE_WHATSAPP=true
RAZORPAY_KEY_ID=         # public-ish
RAZORPAY_KEY_SECRET=     # server only
```

---

## 15. Implementation order (auth)

1. Admin password auth + middleware + roles field  
2. Customer OTP request/verify + JWT  
3. Refresh rotation + logout revoke  
4. OTP rate limits + hashed OTP storage  
5. Signed Cloudinary uploads  
6. Chat authorization rules (with chat module)  
7. Razorpay verify path (when payments module sold)

Do not ship production Play builds without steps 1–5.
