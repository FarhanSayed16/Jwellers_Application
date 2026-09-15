# Phase 21 — Completion Record

**Phase:** 21 — Push notifications (FCM)  
**Completed:** 2026-09-11  

---

## Checklist

### 21.1 Backend
- [x] Firebase Admin setup (`services/fcm.ts` + service account path / `FCM_DRY_RUN`)
- [x] `POST /devices` · `DELETE /devices` (customer auth)
- [x] `POST /rates/notify` fan-out `rates_updated`
- [x] New arrival notify on create/update when active + `isNewArrival`
- [x] Chat staff→customer FCM nudge (opaque `threadId` only)

### 21.2 Mobile
- [x] FlutterFire (`firebase_core` / `firebase_messaging`) + flavor `google-services.json`
- [x] `/notifications/prime` permission screen
- [x] Handlers route `rates_updated` / `chat_message` / `new_arrival`
- [x] Token register after OTP + `onTokenRefresh`; unregister on logout

### 21.3 Admin
- [x] Rates “Notify customers” checkbox → `POST /rates/notify`

### 21.4 Gate
- [x] `npm run verify:fcm` — devices + rates notify + arrival + chat opaque payload (`FCM_DRY_RUN`)
- [x] Mobile unit test for payload routing (`phase21_gate_test.dart`)

---

## Verify

```bash
npm run verify:fcm -w @jwellers/api
npm run build -w @jwellers/admin
cd apps/mobile && flutter pub get && flutter test test/phase21_gate_test.dart
```

## Deferred / ops

| Item | Notes |
|---|---|
| Physical device receive | Per-flavor Firebase: place `google-services.json` under `android/app/src/<flavor>/` — see [FIREBASE_FLAVOR_SETUP.md](./FIREBASE_FLAVOR_SETUP.md). Shared Kavach hardcode removed (C-02). |
| iOS APNs | FlutterFire iOS setup + certificates |
| Admin staff devices | Staff FCM not in MVP (inbox polls) |

## Next

**Phase 22 — Launch modules (Hallmark, Offers, polish)**
