# Phase 19 — Completion Record

**Phase:** 19 — Mobile — Auth, account, wishlist, enquire, WhatsApp  
**Completed:** 2026-09-07  

---

## Checklist

### 19.1 Auth
- [x] Phone (`+91`) · OTP with cooldown / autofill hint · `devOtp` prefill in non-prod
- [x] Soft-login sheet + `returnTo`
- [x] Token persist · splash silent refresh · Dio 401 queue

### 19.2 Account
- [x] Feature-aware hub (wishlist, enquiries, custom, offers, rates, size, about, theme, privacy)
- [x] Logout · delete confirm stub
- [x] About retailer · theme settings

### 19.3 Leads
- [x] Wishlist list + heart sync
- [x] Enquire bottom sheet → `POST /enquiries`
- [x] My enquiries list
- [x] Custom request form (HTTPS reference URLs; gallery picker deferred)

### 19.4 WhatsApp
- [x] Item detail + calculator share (`FEATURE_WHATSAPP`)

### 19.5 Gate
- [x] Flow 2 / 7 / 8 UI wired (needs Mongo + OTP for live Demo)
- [x] Guest browse unchanged (soft-gate only)

---

## Verify

```bash
cd apps/mobile
flutter analyze
flutter test
```

Live OTP: non-prod API returns `devOtp` when MSG91 skipped.

## Deferred

| Item | Target |
|---|---|
| Image picker → signed Cloudinary for custom requests | Demo Cloudinary / before Phase 25 |
| FCM device register after OTP | Phase 21 |

## Next

**Phase 20 — Chat Phase A**
