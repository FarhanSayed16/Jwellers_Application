# 15 — External gaps, mocks & setup guide

**Purpose:** Everything built so far that still depends on a **real vendor account**, **client asset**, or a **temporary mock/fallback**. Use this as a checklist when moving from engineering dogfood → Demo → Ratnaraj production.

**Status snapshot:** Phases **01–20** engineering complete. Items below are intentional gaps (not unfinished code).

**Related:** [14 Master Plan §Deferred log](./14_MASTER_EXECUTION_PLAN.md#deferred-log) · [01 Accounts checklist](./phase01/01_ACCOUNTS_CHECKLIST.md) · [Running costs](./commercial/RUNNING_COSTS.md)

---

## How to read this doc

| Column | Meaning |
|---|---|
| **What you see today** | Current behaviour (mock / skip / fallback / stub UI) |
| **What “done” means** | Live behaviour once wired |
| **Get it from** | Where to sign up / who provides it |
| **Env / config** | Keys or files to fill |
| **Needed by** | Latest phase that unblocks Demo or production |

---

## 1. Infrastructure & databases

### 1.1 MongoDB Atlas (Demo)

| | |
|---|---|
| **What you see today** | Verify scripts use **`mongodb-memory-server`**. Runtime API often returns `DATABASE_UNAVAILABLE` / empty catalog if `MONGODB_URI` is missing or unreachable. Public branding can still load via **file fallback**. |
| **What “done” means** | Persistent Demo DB: rates, catalog, OTP sessions, chat, wishlist all survive restarts. |
| **Get it from** | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) → free **M0** cluster for Demo. Create DB user + Network Access (allow your IP / Render IPs). |
| **Env / config** | `MONGODB_URI=mongodb+srv://...` in `apps/api/.env` |
| **Needed by** | Before Phase 25 dogfood (ideally now for local Demo) |

**Guide:** Atlas → Create Project “Demo Jewellers” → Build Cluster (M0) → Database Access → Connect → Drivers → copy URI → paste into `.env` → `npm run seed:owner` / `seed:shop` (or Admin create catalog).

---

### 1.2 Public shop config file fallback

| | |
|---|---|
| **What you see today** | `GET /config/public` returns `source: "file_fallback"` from `clients/demo/branding/tokens.json` when no active `shop_config` in Mongo. |
| **What “done” means** | `source: "database"` after Admin branding save / seed. |
| **Get it from** | Same Atlas + Admin **Branding** page (or seed script). |
| **Env / config** | Needs working `MONGODB_URI` |
| **Needed by** | Demo dogfood |

---

### 1.3 Render (API hosting) & Vercel (Admin hosting)

| | |
|---|---|
| **What you see today** | Local `npm run dev:api` / `dev:admin` only. Not deployed. |
| **What “done” means** | Demo API URL + Admin URL reachable on the internet. |
| **Get it from** | [Render](https://render.com) (Web Service) · [Vercel](https://vercel.com) (import `apps/admin`) |
| **Env / config** | All `apps/api/.env.example` vars on Render; `NEXT_PUBLIC_API_BASE_URL` on Vercel |
| **Needed by** | Phase 24–25 deploy / dogfood |

**Guide:** Create **Demo** accounts owned by you (provider); later **Ratnaraj** accounts owned by Client ([01 Accounts](./phase01/01_ACCOUNTS_CHECKLIST.md)).

---

## 2. Auth & messaging

### 2.1 MSG91 — live OTP SMS

| | |
|---|---|
| **What you see today** | Empty `MSG91_*` → SMS **skipped**. Non-prod OTP request returns **`devOtp`** in JSON (prefilled on mobile OTP screen). Optional `OTP_DEV_BYPASS=true` + fixed code. |
| **What “done” means** | Real SMS to Indian mobiles; no `devOtp` in production. |
| **Get it from** | [MSG91](https://msg91.com) → DLT-registered sender + OTP template (India). |
| **Env / config** | `MSG91_AUTH_KEY` · `MSG91_TEMPLATE_ID` · `MSG91_SENDER_ID` · turn off `OTP_DEV_BYPASS` in prod |
| **Needed by** | Before Phase 25 Demo dogfood |

**Guide:**  
1. Sign up MSG91 → create Auth key.  
2. Register **Sender ID** + **OTP template** (variables must match `apps/api` MSG91 client — check `src/services/msg91.ts`).  
3. Put keys in `.env` → request OTP from mobile → phone receives SMS; response must **not** include `devOtp` in production.

---

### 2.2 Admin JWT in localStorage (MVP)

| | |
|---|---|
| **What you see today** | Admin access/refresh tokens in **browser localStorage** (+ session cookie for middleware). Documented security trade-off. |
| **What “done” means** | Prefer **httpOnly** cookies / BFF (hardening). |
| **Get it from** | Engineering change (Phase 24 hardening), not a vendor. |
| **Needed by** | Phase 24 preferred; OK for Demo MVP |

---

### 2.3 Customer account deletion UX

| | |
|---|---|
| **What you see today** | Soft-delete API exists; mobile has type-`DELETE` confirm stub. Full legal / OTP confirm UX deferred. |
| **What “done” means** | Play-compliant deletion flow + privacy links. |
| **Get it from** | Legal copy + Phase 23 implementation. |
| **Needed by** | Phase 23 / Play submit |

---

## 3. Media (Cloudinary)

### 3.1 Live Cloudinary cloud (Demo)

| | |
|---|---|
| **What you see today** | `POST /media/sign` returns **`MEDIA_NOT_CONFIGURED`** (503) if Cloudinary env empty. Signing algorithm + policy are implemented and verified offline. |
| **What “done” means** | Admin/mobile can upload images to `clients/<slug>/(items|chat|branding)`. |
| **Get it from** | [Cloudinary](https://cloudinary.com) free tier for Demo. |
| **Env / config** | `CLOUDINARY_CLOUD_NAME` · `CLOUDINARY_API_KEY` · `CLOUDINARY_API_SECRET` |
| **Needed by** | Catalog photos, branding logo, chat/custom-request uploads |

**Guide:** Dashboard → Account Details → copy cloud name, API key, API secret → `.env` → restart API → Admin item image upload / branding logo.

---

### 3.2 Image pickers → signed upload (mobile / admin chat)

| | |
|---|---|
| **What you see today** | **Custom requests**, **chat composers** (mobile + admin) accept **pasted HTTPS URLs** instead of gallery → Cloudinary. |
| **What “done” means** | Device gallery / file picker → `POST /media/sign` (`purpose=chat` or `custom_requests`) → direct Cloudinary upload → URL stored. |
| **Get it from** | Needs §3.1 Cloudinary first; then Flutter `image_picker` + upload helper / Admin file input. |
| **Needed by** | Polish before Phase 25 (or when Demo Cloudinary is live) |

---

## 4. Push & mobile packaging

### 4.1 Firebase / FCM

| | |
|---|---|
| **What you see today** | API: `POST /devices`, `POST /rates/notify`, chat/arrival FCM. Mobile: permission prime + handlers. Gate: `verify:fcm` (dry-run). |
| **What “done” means** | Device tokens registered; rate/chat/new-arrival pushes. Live OS notification on a physical device. |
| **Get it from** | [Firebase Console](https://console.firebase.google.com) → Android app per flavor · Service account for API (`apps/api/secrets/`). |
| **Env / config** | `FCM_PROJECT_ID` · `FIREBASE_SERVICE_ACCOUNT_PATH` · FlutterFire per flavor (`google-services.json`) |
| **Needed by** | Live device QA before Phase 25 |

---

### 4.2 Brand launcher icons & native splash

| | |
|---|---|
| **What you see today** | Default Flutter/`ic_launcher` · Dart splash loads remote theme. |
| **What “done” means** | Per-flavor icons + splash matching Demo / Ratnaraj brand. |
| **Get it from** | Designer / Client logo assets → `flutter_launcher_icons` / native splash tools. |
| **Needed by** | Phase 26–27 Play listing |

---

### 4.3 iOS flavors / App Store

| | |
|---|---|
| **What you see today** | Android `demo` / `ratnaraj` productFlavors + Dart entrypoints. iOS schemes stubbed (`ios/FLAVORS.md`). **Android-first** locked. |
| **What “done” means** | Xcode schemes, bundle IDs, Apple Developer + App Store if Client pays for iOS. |
| **Get it from** | Apple Developer Program (Client) when iOS is sold. |
| **Needed by** | Phase 26–27 only if iOS in scope |

---

## 5. Client assets (Ratnaraj / Demo content)

### 5.1 Ratnaraj branding & intake

| | |
|---|---|
| **What you see today** | Placeholder tokens in `clients/ratnaraj/branding/tokens.json`. Intake form incomplete. |
| **What “done” means** | Final logo, colours, fonts, GST, address, phone, socials. |
| **Get it from** | **Client** (Ratnaraj) — email/WhatsApp asset pack. Track in `clients/ratnaraj/INTAKE.md`. |
| **Needed by** | Phase 26 provisioning |

---

### 5.2 Sample catalog photos / SKUs

| | |
|---|---|
| **What you see today** | Empty catalog until Admin creates items (or verify scripts on memory DB). No permanent Demo product photos. |
| **What “done” means** | Seeded Demo catalog with real images (Cloudinary URLs). |
| **Get it from** | Client sample photos **or** stock jewellery photos you license · upload via Admin after Cloudinary. |
| **Needed by** | Phase 25 Demo dogfood / sales demos |

---

### 5.3 Launch modules Client countersign

| | |
|---|---|
| **What you see today** | Recommended module list in docs; not countersigned. |
| **What “done” means** | Written WhatsApp/email OK on which flags are paid for Ratnaraj. |
| **Get it from** | Client confirmation vs [01 Launch modules](./phase01/01_LAUNCH_MODULES.md). |
| **Needed by** | Before Phase 26 |

---

### 5.4 Commercial ₹ pricing (quote / AMC)

| | |
|---|---|
| **What you see today** | Templates without final prices. |
| **What “done” means** | Filled quote + AMC tiers for Client. |
| **Get it from** | Your commercial decision · `docs/commercial/`. |
| **Needed by** | Before Client quote |

---

## 6. App / UX stubs that are “real enough” but incomplete

| Area | Today | Finish when |
|---|---|---|
| **Mobile Offers screen** | Live `/offers` + scheduling | Flag `FEATURE_OFFERS` |
| **Mobile Privacy / Delete** | Hosted `/legal/*` + in-app delete with `DELETE` confirm | Counsel review before production listing |
| **Admin tokens in localStorage** | MVP | Phase 24 hardening |
| **Chat / rates notify** | FCM + polling | Register Firebase Android apps for live OS push |
| **Hallmark / BIS trust copy** | Flag + fields partly ready | Phase 22 |
| **WhatsApp Business API** | Consumer `wa.me` deep links only | Paid module later |
| **Razorpay / billing / old gold** | Feature flags **off** | Phase 30+ |
| **Rate API auto-fetch** | Manual admin rates | Paid `FEATURE_RATE_API` later |
| **CI** | Basic lint stubs | Expand in Phase 24 |
| **Sentry** | Not wired | Phase 24 |
| **Play Console / keystore** | Not created | Phase 27 · Client owns Play |

---

## 7. Vendor accounts checklist (who opens what)

### Demo (you / provider — open ASAP)

| Account | Why | Link |
|---|---|---|
| MongoDB Atlas M0 | Persistent Demo DB | https://cloud.mongodb.com |
| Cloudinary free | Images | https://cloudinary.com |
| MSG91 | OTP SMS | https://msg91.com |
| Firebase | FCM (Phase 21) | https://console.firebase.google.com |
| Render | Host API | https://render.com |
| Vercel | Host Admin | https://vercel.com |
| GitHub (already) | CI / deploy hooks | — |

### Ratnaraj (Client-owned — Phase 26+)

| Account | Why |
|---|---|
| Play Console ($25) | App listing |
| Atlas / Cloudinary / MSG91 / Firebase | Isolation |
| Render Starter + Vercel | Production host |
| Optional Apple Developer | If iOS sold |

Full table: [phase01/01_ACCOUNTS_CHECKLIST.md](./phase01/01_ACCOUNTS_CHECKLIST.md).

---

## 8. Suggested order to “un-mock” (practical)

Do this sequence for a **working Demo** on a real phone:

1. **MongoDB Atlas** → set `MONGODB_URI` → seed owner + shop → create rates + categories/items in Admin.  
2. **Cloudinary** → set three env vars → upload item images + logo.  
3. **MSG91** → set template + keys → test OTP on a real phone (leave `devOtp` only for local).  
4. **Point mobile** at API:  
   `flutter run --flavor demo -t lib/main_demo.dart --dart-define=API_BASE_URL=https://YOUR-API/api/v1`  
   (Android emulator often needs `http://10.0.2.2:4000/api/v1` for local.)  
5. **Firebase (Phase 21)** when you want push.  
6. **Render + Vercel** when you want remote Demo without local machines.  
7. **Client assets + Play** when starting Ratnaraj (Phase 26–27).

---

## 9. Quick “is it mock?” diagnostic

| Symptom | Likely gap |
|---|---|
| Catalog / rates / chat empty or `DATABASE_UNAVAILABLE` | Mongo not connected |
| OTP shows code on screen / in API JSON | MSG91 empty or non-prod skip |
| Image upload fails / 503 `MEDIA_NOT_CONFIGURED` | Cloudinary env empty |
| Custom request / chat only accepts URL paste | Gallery picker deferred (needs Cloudinary + UI) |
| No push when rates/chat update | FCM Phase 21 |
| Branding from file, Admin branding not sticking | Mongo down → file_fallback |
| Chat tab missing | `FEATURE_CHAT=false` |
| Default green Flutter icon | Brand icons deferred |

---

## 10. Env template reminder

Copy from `apps/api/.env.example`. Minimum for Demo dogfood:

```env
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=...   # long random
JWT_REFRESH_SECRET=...
OTP_PEPPER=...
MSG91_AUTH_KEY=...
MSG91_TEMPLATE_ID=...
MSG91_SENDER_ID=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
ADMIN_CORS_ORIGIN=https://your-admin.vercel.app,http://localhost:3000
```

Mobile: `NEXT_PUBLIC_API_BASE_URL` equivalent is `--dart-define=API_BASE_URL=...`.

---

## Changelog

| Date | Note |
|---|---|
| 2026-09-11 | Initial guide covering Phases 01–20 gaps + setup order |
