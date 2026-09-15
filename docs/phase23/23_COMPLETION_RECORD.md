# Phase 23 — Completion Record

**Phase:** 23 — Legal, privacy, account deletion, Play readiness  
**Completed:** 2026-09-11  

---

## Checklist

### 23.1 Policies
- [x] Privacy / Terms / Delete-account pages hosted on Admin (`/legal/*`, public middleware)
- [x] In-app Account → Privacy / Terms · phone OTP microcopy links
- [x] Play Data safety disclosures drafted (`PLAY_DATA_SAFETY.md`)

### 23.2 Account deletion
- [x] Mobile delete UI + type `DELETE` confirm
- [x] API requires `{ confirm: "DELETE" }` · anonymize phone · revoke sessions · deactivate devices · clear wishlist
- [x] Same phone can OTP again as a **new** customer
- [x] Store listing web path `/legal/delete-account`

### 23.3 Permissions audit
- [x] Android manifest: `INTERNET` + `POST_NOTIFICATIONS` only (no camera)
- [x] Notes in `PERMISSIONS_AUDIT.md`

### 23.4 Gate
- [x] `npm run verify:phase23` — Flow 12
- [x] Legal URLs on `GET /config/public`

---

## Verify

```bash
npm run verify:phase23 -w @jwellers/api
# Optional: open http://localhost:3000/legal/privacy with admin `npm run dev`
```

## Env

```
LEGAL_PRIVACY_URL=http://localhost:3000/legal/privacy
LEGAL_TERMS_URL=http://localhost:3000/legal/terms
LEGAL_DELETE_ACCOUNT_URL=http://localhost:3000/legal/delete-account
LEGAL_SUPPORT_EMAIL=support@shop.example
```

## Next

**Phase 24 — Production hardening**
