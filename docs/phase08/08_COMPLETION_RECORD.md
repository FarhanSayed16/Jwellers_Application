# Phase 08 — Completion Record

**Phase:** 08 — Customer OTP authentication  
**Completed:** 2026-09-07  

---

## Checklist

### 08.1 OTP
- [x] Phone normalize/validate (India → E.164 `+91…`)
- [x] `POST /api/v1/auth/customer/otp/request` (hash OTP, MSG91 send or skip)
- [x] Rate limits (phone/hour, IP/hour, cooldown)
- [x] `POST /api/v1/auth/customer/otp/verify`
- [x] Upsert customer + sessions + tokens (`aud: customer`)
- [x] `POST /api/v1/auth/customer/token/refresh`
- [x] `POST /api/v1/auth/customer/logout`
- [x] `GET/PATCH /api/v1/auth/customer/me`
- [x] `DELETE /api/v1/auth/customer/me` (soft-delete + anonymize; legal polish → Phase 23)

### 08.2 Safety
- [x] OTP never logged plaintext (hash + pepper; `devOtp` only in non-prod response when SMS skipped)
- [x] MSG91 template env keys ready (`MSG91_*`); Demo account config deferred until vendor account exists
- [x] Dev bypass via `OTP_DEV_BYPASS` + empty MSG91 → `devOtp` (non-production only)

### 08.3 Gate
- [x] Request → verify → me (verify script)
- [x] 429 `OTP_COOLDOWN` on abuse path
- [x] Customer token rejected on `/admin/*`

---

## Key paths

| Path | Role |
|---|---|
| `src/modules/auth/customerAuth.routes.ts` | Customer auth routes |
| `src/modules/auth/customerAuth.service.ts` | OTP + sessions |
| `src/middleware/auth.ts` | `requireCustomer` |
| `src/utils/phone.ts` | India phone normalize |
| `src/services/msg91.ts` | SMS send / skip |
| `src/scripts/verifyCustomerAuth.ts` | Phase 08 gate |

## Verify

```bash
npm run verify:customer-auth -w @jwellers/api
```

## Deferred

- Real MSG91 Demo template + live SMS send — needs Demo vendor account (same as Phase 01 deferred accounts)
- Full account-deletion legal UX (confirm OTP / CONFIRM) — Phase 23

## Next

**Phase 09 — Rates API**
