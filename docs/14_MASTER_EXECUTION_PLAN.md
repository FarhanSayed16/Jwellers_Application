# 14 — MASTER EXECUTION PLAN (Final Checklist)

**Status:** THE project execution document  
**How to use:** Work phase by phase. Do not mark a phase complete until **every** sub-phase checkbox is done (or explicitly deferred with a written note in §Deferred).  
**Source docs:** [01](./01_PRODUCT_AND_ARCHITECTURE.md)–[13](./13_END_TO_END_FLOWS.md) · [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)  
**Stack:** Flutter · Express/TS · MongoDB Atlas · Next.js · Render · Vercel Hobby · Cloudinary · MSG91 · FCM  
**First client:** Ratnaraj Jewellers · Template brand: Demo Jewellers  

---

## Progress tracker (update as you go)

| Phase | Name | Status | Owner | Done date |
|---|---|---|---|---|
| 01 | Kickoff, contracts, client intake | ☐ Not started | | |
| 02 | Wireframes & design sign-off | ☐ | | |
| 03 | Monorepo & tooling skeleton | ☐ | | |
| 04 | Backend foundation & env | ☐ | | |
| 05 | Database models & indexes | ☐ | | |
| 06 | Public config & feature flags | ☐ | | |
| 07 | Admin authentication | ☐ | | |
| 08 | Customer OTP authentication | ☐ | | |
| 09 | Rates API | ☐ | | |
| 10 | Catalog API (categories + items) | ☐ | | |
| 11 | Media / Cloudinary signing | ☐ | | |
| 12 | Wishlist, enquiries, custom requests API | ☐ | | |
| 13 | Admin web — shell, auth, dashboard | ☐ | | |
| 14 | Admin web — rates & catalog | ☐ | | |
| 15 | Admin web — branding, enquiries, settings | ☐ | | |
| 16 | Mobile — foundation, flavors, theme, router | ☐ | | |
| 17 | Mobile — Home, Collection, Item detail | ☐ | | |
| 18 | Mobile — Calculator, rate history, size guide | ☐ | | |
| 19 | Mobile — Auth, account, wishlist, enquire, WhatsApp | ☐ | | |
| 20 | Chat Phase A — API + Admin + Mobile | ☐ | | |
| 21 | Push notifications (FCM) | ☐ | | |
| 22 | Launch modules (Hallmark, Offers, Soft-delete UX, Search/Filter) | ☐ | | |
| 23 | Legal, privacy, account deletion, Play readiness | ☐ | | |
| 24 | Production hardening (errors, health, backups, Sentry, smoke) | ☐ | | |
| 25 | Demo Jewellers dogfood & QA sign-off | ☐ | | |
| 26 | Ratnaraj provisioning & data load | ☐ | | |
| 27 | Play Store submit & closed/open testing | ☐ | | |
| 28 | Retailer training & ownership handoff | ☐ | | |
| 29 | Post-launch stabilize & AMC baseline | ☐ | | |
| 30 | Monetization modules (Billing, Payments, Old-gold, etc.) | ☐ | | |
| 31 | Showroom bridge (QR, deep links, share rate card, appointments) | ☐ | | |
| 32 | Growth pack (CRM-lite, analytics, schemes, referrals) | ☐ | | |
| 33 | Second-client automation & onboarding kit | ☐ | | |
| 34 | Premium messaging & rate API | ☐ | | |
| 35 | Year-1 closeout & roadmap refresh | ☐ | | |

**Status legend:** ☐ Not started · ◐ In progress · ✅ Complete · ⏸ Deferred · ✖ Cancelled  

---

## Rules for execution

1. **One source of truth:** Spec details live in docs 01–13; this file is the **checklist**. If conflict, fix the detail doc, then tick here.  
2. **No silent skips:** Deferred items go to [§Deferred log](#deferred-log) with reason + target phase.  
3. **Phase gate:** Next phase starts only when current phase checkboxes are ✅ or ⏸.  
4. **Dedicated infra:** Never introduce shared multi-tenant DB.  
5. **Feature flags:** Optional modules stay behind `.env` flags ([04](./04_FEATURES_AND_MODULES.md)).  
6. **Integration proof:** Prefer completing Flow tests in [13](./13_END_TO_END_FLOWS.md) before marking related phases done.  

---

# PHASE 01 — Kickoff, contracts, client intake

**Goal:** Business and scope locked so engineering does not rebuild assumptions.  
**Refs:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) · [04](./04_FEATURES_AND_MODULES.md) · [06](./06_LEGAL_AND_COMPLIANCE.md) · [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)

### 01.1 Internal alignment
- [ ] Confirm locked stack (Flutter, Express/TS, Mongo, Next, Render, Vercel Hobby)
- [ ] Confirm dedicated-infra model (no multi-tenant)
- [ ] Assign owners: Backend, Admin, Mobile, Docs/QA
- [ ] Agree communication channel + weekly checkpoint using this master plan

### 01.2 Commercial templates
- [ ] MSA / engagement agreement draft (template ownership vs client data/accounts)
- [ ] Module annex / quote template (base + flags + AMC) from [04](./04_FEATURES_AND_MODULES.md)
- [ ] Running-cost expectation sheet for client (infra only) from [01](./01_PRODUCT_AND_ARCHITECTURE.md)
- [ ] AMC tier names drafted (Bronze/Silver/Gold — prices TBD)

### 01.3 Ratnaraj intake
- [ ] Collect logo (PNG/SVG), light + dark preferred colors
- [ ] Collect shop name, address, phone, WhatsApp, GST, BIS (if any)
- [ ] Collect sample catalog (photos + SKUs + categories)
- [ ] Confirm module ON/OFF at launch (Chat, WhatsApp, Hallmark, Billing, Razorpay, etc.)
- [ ] Confirm Android-only for v1 (iOS deferred unless paid)
- [ ] Confirm who owns Play Console / hosting accounts (client)

### 01.4 Accounts to open (client-owned where possible)
- [ ] Google account / Play Console plan
- [ ] MongoDB Atlas
- [ ] Render
- [ ] Vercel
- [ ] Cloudinary
- [ ] MSG91
- [ ] Firebase (FCM)

### 01.5 Phase 01 gate
- [ ] Written launch module list signed (even informally)
- [ ] All intake assets in `clients/ratnaraj/` (or Drive with link logged here)

---

# PHASE 02 — Wireframes & design sign-off

**Goal:** Every Core + Chat screen designed before feature coding.  
**Refs:** [10](./10_ADMIN_WEB_PAGES.md) · [11](./11_MOBILE_APP_SCREENS.md) · [12](./12_DESIGN_SYSTEM.md)

### 02.1 Design system baseline
- [ ] Token list agreed (colors, spacing, radius, type roles)
- [ ] Fonts chosen for Demo + Ratnaraj (display + body)
- [ ] Light + dark palettes drafted for Demo
- [ ] Light + dark palettes drafted for Ratnaraj
- [ ] Icon set chosen (admin + mobile)

### 02.2 Mobile wireframes (default / loading / empty / error / dark for critical)
- [ ] Splash / bootstrap
- [ ] Home
- [ ] Collection → subcategory → item grid
- [ ] Item detail
- [ ] Calculator
- [ ] Rate history
- [ ] Size guide
- [ ] Search
- [ ] Auth phone + OTP
- [ ] Account
- [ ] Wishlist
- [ ] Enquiries
- [ ] Custom requests (+ form)
- [ ] Chat list + thread
- [ ] About / Privacy / Delete account
- [ ] Soft-login bottom sheet

### 02.3 Admin wireframes
- [ ] Login / forgot / reset
- [ ] Shell (sidebar + topbar)
- [ ] Dashboard
- [ ] Rates (+ history)
- [ ] Categories
- [ ] Items list + item form
- [ ] Enquiries list + detail
- [ ] Custom requests
- [ ] Chat inbox + thread
- [ ] Offers (flag)
- [ ] Branding
- [ ] Staff
- [ ] Settings
- [ ] Invoices / Payments placeholders (hidden if flag off)

### 02.4 Flow review
- [ ] Walk Flows 2–9, 12 from [13](./13_END_TO_END_FLOWS.md) against wireframes
- [ ] Confirm Chat tab hidden when flag off
- [ ] Sign-off from both developers

### 02.5 Phase 02 gate
- [ ] Wireframe pack linked in README or `/docs/design/`
- [ ] No major open UI questions blocking Phase 03+

---

# PHASE 03 — Monorepo & tooling skeleton

**Goal:** Empty-but-runnable structure for api, admin, mobile, clients.  
**Refs:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) §10

### 03.1 Repo layout
- [ ] Create `apps/api`, `apps/admin`, `apps/mobile`
- [ ] Create `packages/shared-types` (optional stub)
- [ ] Create `clients/demo`, `clients/ratnaraj` (branding + flavor placeholders)
- [ ] Root README pointing to `docs/README.md`
- [ ] `.gitignore` (node, flutter, env, keys, build)

### 03.2 Tooling
- [ ] Node package manager chosen (npm/pnpm/yarn) + workspaces if used
- [ ] TypeScript configs for api + admin
- [ ] ESLint/Prettier (api + admin)
- [ ] Flutter analyze/lints enabled
- [ ] EditorConfig / consistent formatting

### 03.3 CI stubs
- [ ] GitHub Actions: lint api (stub OK)
- [ ] GitHub Actions: lint admin (stub OK)
- [ ] Codemagic or GHA note for Flutter (pipeline wired later Phase 16/27)

### 03.4 Phase 03 gate
- [ ] `apps/api` boots hello/health locally
- [ ] `apps/admin` boots empty Next page locally
- [ ] `apps/mobile` boots empty Flutter counter/flavor stub

---

# PHASE 04 — Backend foundation & env

**Goal:** Express app shell production-shaped.  
**Refs:** [09](./09_BACKEND_API.md) · [02](./02_AUTH_AND_SECURITY.md)

### 04.1 App bootstrap
- [ ] `app.ts` / `index.ts` structure
- [ ] Helmet, CORS (`ADMIN_CORS_ORIGIN`), JSON body parser
- [ ] Request ID middleware
- [ ] Global light rate limit
- [ ] Central error handler (standard error JSON)
- [ ] Success response helper

### 04.2 Env
- [ ] `env.ts` with zod (or equivalent) validation
- [ ] `.env.example` complete (all keys from [02](./02_AUTH_AND_SECURITY.md) §14 + flags from [04](./04_FEATURES_AND_MODULES.md))
- [ ] Fail-fast boot in production if required secrets missing

### 04.3 Health
- [ ] `GET /health`
- [ ] `GET /ready` (DB ping — may stub until Phase 05 connected)
- [ ] `GET /api/v1` version info optional

### 04.4 Phase 04 gate
- [ ] Local server runs; health returns 200
- [ ] Error format matches [09](./09_BACKEND_API.md) §4.2

---

# PHASE 05 — Database models & indexes

**Goal:** All Core collections exist with indexes.  
**Refs:** [03](./03_DATA_MODEL.md)

### 05.1 Connection
- [ ] Mongo connection module
- [ ] Dev Atlas cluster (template/demo) connected

### 05.2 Models (implement + indexes)
- [ ] `shop_configs`
- [ ] `admin_users`
- [ ] `customers`
- [ ] `sessions`
- [ ] `otp_challenges` (+ TTL)
- [ ] `categories`
- [ ] `items`
- [ ] `rates`
- [ ] `wishlists`
- [ ] `enquiries`
- [ ] `custom_requests`
- [ ] `offers`
- [ ] `chat_threads`
- [ ] `chat_messages`
- [ ] `devices`
- [ ] `audit_logs`
- [ ] `feature_events` (stub OK)
- [ ] `invoices` (schema ready even if routes later)
- [ ] `payments` (schema ready even if routes later)

### 05.3 Scripts
- [ ] `seedOwner.ts` (create first owner)
- [ ] `seedShopConfig.ts` (Demo branding)
- [ ] Migration runner stub (`migrate.ts`)

### 05.4 Phase 05 gate
- [ ] Seed owner can be created against Demo DB
- [ ] Indexes verified in Atlas

---

# PHASE 06 — Public config & feature flags

**Goal:** White-label runtime config works.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) · [09](./09_BACKEND_API.md)

### 06.1 Endpoints
- [ ] `GET /api/v1/config/public` (shop, themes, contact, defaults — no secrets)
- [ ] `GET /api/v1/config/features` (booleans + public Razorpay key id only)
- [ ] `GET /api/v1/admin/shop-config` (auth later; stub or lock until Phase 07)
- [ ] `PATCH /api/v1/admin/shop-config` (owner — after auth)

### 06.2 Feature middleware
- [ ] `requireFeature('CHAT' | …)` helper
- [ ] 403 `FEATURE_DISABLED` when off

### 06.3 Phase 06 gate
- [ ] Public config returns Demo tokens
- [ ] Features JSON matches env
- [ ] Secrets never appear in public responses (manual review)

---

# PHASE 07 — Admin authentication

**Goal:** Secure retailer login.  
**Refs:** [02](./02_AUTH_AND_SECURITY.md) · [13](./13_END_TO_END_FLOWS.md) Flow 4

### 07.1 Core auth
- [ ] Password hashing (bcrypt/argon2)
- [ ] `POST /auth/admin/login`
- [ ] Access + refresh JWT issuance (admin claims)
- [ ] `POST /auth/admin/token/refresh` + rotation
- [ ] `POST /auth/admin/logout` (revoke session)
- [ ] `GET /auth/admin/me`
- [ ] `requireAdmin` / `requireOwner` middleware

### 07.2 Hardening
- [ ] Failed login lockout
- [ ] Password min rules
- [ ] Forgot/reset password endpoints (basic)
- [ ] Audit log on login success/failure

### 07.3 Phase 07 gate
- [ ] Seed owner logs in via API client (Postman)
- [ ] Staff role cannot call owner-only routes (test with second user when exists; else unit test role check)

---

# PHASE 08 — Customer OTP authentication

**Goal:** Phone OTP login production-safe.  
**Refs:** [02](./02_AUTH_AND_SECURITY.md) · [13](./13_END_TO_END_FLOWS.md) Flow 2–3

### 08.1 OTP
- [ ] Phone normalize/validate (India)
- [ ] `POST /auth/customer/otp/request` (hash OTP, MSG91 send)
- [ ] Rate limits (phone + IP + cooldown)
- [ ] `POST /auth/customer/otp/verify`
- [ ] Upsert customer + sessions + tokens
- [ ] `POST /auth/customer/token/refresh`
- [ ] `POST /auth/customer/logout`
- [ ] `GET/PATCH /auth/customer/me`
- [ ] `DELETE /auth/customer/me` (full behavior may finish Phase 23)

### 08.2 Safety
- [ ] OTP never logged plaintext
- [ ] MSG91 template configured on Demo account
- [ ] Dev bypass OTP **only** in non-production env (optional, documented)

### 08.3 Phase 08 gate
- [ ] Request → verify → me works on test phone
- [ ] 429 on abuse path verified
- [ ] Customer token rejected on `/admin/*`

---

# PHASE 09 — Rates API

**Goal:** Manual rates + history.  
**Refs:** [03](./03_DATA_MODEL.md) · [13](./13_END_TO_END_FLOWS.md) Flow 5 · [09](./09_BACKEND_API.md)

### 09.1 Endpoints
- [ ] `GET /rates/latest` (public)
- [ ] `GET /rates/history`
- [ ] `POST /rates` (admin) append-only
- [ ] Audit on rate create
- [ ] Optional large-change warning handled in admin UI later; API may accept `force`

### 09.2 Calculator helper
- [ ] `POST /calculator/quote` (shared math)

### 09.3 Phase 09 gate
- [ ] Latest updates after POST
- [ ] History returns chronological points
- [ ] Quote matches documented formula ([03](./03_DATA_MODEL.md) §4)

---

# PHASE 10 — Catalog API (categories + items)

**Goal:** Full catalog CRUD for single shop.  
**Refs:** [03](./03_DATA_MODEL.md) · [09](./09_BACKEND_API.md) · [13](./13_END_TO_END_FLOWS.md) Flow 6

### 10.1 Categories
- [ ] List (tree/flat), get, create, patch, soft-delete
- [ ] Parent/child validation
- [ ] Slug unique

### 10.2 Items
- [ ] List with filters (category, subcategory, q, purity, metal, flags, status)
- [ ] Get by id + get by SKU
- [ ] Create / patch / soft-delete / restore
- [ ] Making charge inherit/percent/flat
- [ ] Hallmark fields accepted when present (UI gated later)
- [ ] Duplicate SKU → 409
- [ ] Public list excludes deleted/non-active

### 10.3 Dashboard stats stub
- [ ] `GET /admin/dashboard` counts (items, enquiries, chats, etc. — expand as modules land)

### 10.4 Phase 10 gate
- [ ] Seed 2 categories, 1 subcategory, 3 items via API
- [ ] Public list/filter works

---

# PHASE 11 — Media / Cloudinary signing

**Goal:** Secure uploads.  
**Refs:** [02](./02_AUTH_AND_SECURITY.md) §7 · [09](./09_BACKEND_API.md)

### 11.1 Signing
- [ ] Cloudinary SDK config from env
- [ ] `POST /media/sign` for admin (items, banners, branding)
- [ ] `POST /media/sign` for customer (custom requests / chat) with tighter folder + size rules
- [ ] Reject unsigned public presets in prod

### 11.2 Conventions
- [ ] Folder naming: `clients/<slug>/items|chat|branding`
- [ ] Document allowed mime types + max size

### 11.3 Phase 11 gate
- [ ] Signed upload from Postman/admin prototype succeeds
- [ ] URL stored on item via Phase 10 APIs

---

# PHASE 12 — Wishlist, enquiries, custom requests API

**Goal:** Lead capture APIs ready for UI.  
**Refs:** [09](./09_BACKEND_API.md) · [13](./13_END_TO_END_FLOWS.md) Flows 7–8, 10

### 12.1 Wishlist
- [ ] GET /wishlist, POST, DELETE (customer)
- [ ] Unique customer+item

### 12.2 Enquiries
- [ ] POST /enquiries (customer)
- [ ] GET /enquiries/me
- [ ] GET /admin/enquiries
- [ ] PATCH /admin/enquiries/:id (status, assign)

### 12.3 Custom requests (flag)
- [ ] CRUD paths behind `FEATURE_CUSTOM_REQUESTS`
- [ ] Reference image URLs support

### 12.4 Offers API (flag) — basic
- [ ] Public active offers list
- [ ] Admin CRUD

### 12.5 Phase 12 gate
- [ ] Enquiry appears in admin list after customer POST
- [ ] Wishlist toggle idempotent

---

# PHASE 13 — Admin web — shell, auth, dashboard

**Goal:** Retailer can log into a real shell.  
**Refs:** [10](./10_ADMIN_WEB_PAGES.md) · [12](./12_DESIGN_SYSTEM.md)

### 13.1 Foundation
- [ ] Next.js App Router project wired to API base URL
- [ ] Tailwind + token CSS variables
- [ ] API client (Bearer + refresh)
- [ ] Auth provider / middleware protecting `(app)` routes

### 13.2 Pages
- [ ] Login
- [ ] Forgot / reset (minimum viable)
- [ ] App layout: Sidebar + Topbar
- [ ] Dashboard with rates card + stats + quick actions
- [ ] FeatureGate + role-based nav hiding
- [ ] Empty/error states on dashboard

### 13.3 Phase 13 gate
- [ ] Owner login → dashboard against Demo API
- [ ] Unauthenticated users redirected to login

---

# PHASE 14 — Admin web — rates & catalog

**Goal:** Retailer can operate rates + catalog without Postman.  
**Refs:** [10](./10_ADMIN_WEB_PAGES.md) · [13](./13_END_TO_END_FLOWS.md) Flows 5–6

### 14.1 Rates
- [ ] Rate entry form + validation
- [ ] Confirm on large % change
- [ ] Save → POST /rates
- [ ] History table
- [ ] Notify checkbox wired (may no-op until Phase 21)

### 14.2 Categories
- [ ] List/tree UI
- [ ] Create/edit/delete
- [ ] Cover image upload

### 14.3 Items
- [ ] Items table + filters
- [ ] Create/edit form (all Core sections)
- [ ] Multi-image upload + primary + reorder
- [ ] Soft-delete + restore
- [ ] Image quality guidance banner
- [ ] Status control (draft/active/sold/archived)

### 14.4 Phase 14 gate
- [ ] Create item with 2+ images end-to-end
- [ ] New rate visible via public GET

---

# PHASE 15 — Admin web — branding, enquiries, settings

**Goal:** Branding control + lead inbox.  
**Refs:** [10](./10_ADMIN_WEB_PAGES.md)

### 15.1 Branding (owner)
- [ ] Shop identity fields
- [ ] Light/dark token pickers + preview
- [ ] Logo upload
- [ ] Making/GST defaults
- [ ] Social links
- [ ] Save PATCH shop-config

### 15.2 Enquiries & custom requests
- [ ] Enquiries inbox + detail + status
- [ ] Custom requests inbox (if flag)

### 15.3 Offers admin (if flag)
- [ ] List + form + scheduling fields

### 15.4 Staff (owner) — minimum
- [ ] List admins
- [ ] Create staff user
- [ ] Deactivate staff
- [ ] Nav hidden for staff on branding/staff

### 15.5 Settings
- [ ] Profile / password change
- [ ] Read-only feature module list
- [ ] Logout

### 15.6 Phase 15 gate
- [ ] Branding change reflected in `/config/public`
- [ ] Staff user cannot open branding route

---

# PHASE 16 — Mobile — foundation, flavors, theme, router

**Goal:** Flutter app boots branded with remote config.  
**Refs:** [11](./11_MOBILE_APP_SCREENS.md) · [12](./12_DESIGN_SYSTEM.md)

### 16.1 Flavors
- [ ] `demo` flavor (app id, name, icon, splash, API URL)
- [ ] `ratnaraj` flavor stubs
- [ ] Flavor entrypoints

### 16.2 Core libs
- [ ] Dio client + interceptors (auth refresh queue)
- [ ] Secure storage
- [ ] go_router with full route table (screens can be placeholders)
- [ ] Riverpod root
- [ ] `publicConfigProvider` + `featuresProvider`
- [ ] ThemeData from tokens (light/dark/system)
- [ ] Splash bootstrap sequence ([11](./11_MOBILE_APP_SCREENS.md) §4)

### 16.3 Shared widgets
- [ ] Primary/secondary buttons
- [ ] Skeletons
- [ ] Empty/error+retry
- [ ] Cached image with placeholder

### 16.4 Phase 16 gate
- [ ] Demo flavor launches, loads config, applies theme
- [ ] Chat tab absent when FEATURE_CHAT=false (test both)

---

# PHASE 17 — Mobile — Home, Collection, Item detail

**Goal:** Browse catalog on device.  
**Refs:** [11](./11_MOBILE_APP_SCREENS.md) · [12](./12_DESIGN_SYSTEM.md)

### 17.1 Home
- [ ] App bar logo/name, call, bell
- [ ] Hero
- [ ] Search entry
- [ ] Rates cards + gold/silver toggle + timestamp + Live
- [ ] New arrivals / featured / category rows
- [ ] Pull-to-refresh

### 17.2 Collection flows
- [ ] Category grid
- [ ] Subcategory grid
- [ ] Item grid + wishlist heart UI (auth may soft-gate)
- [ ] Search screen (title/SKU/tags)
- [ ] Filters sheet (basic)

### 17.3 Item detail
- [ ] Gallery
- [ ] SKU/title/metal/purity/weights
- [ ] Price breakup via quote/rates
- [ ] CTA placeholders: Enquire / Chat / WhatsApp
- [ ] Hallmark badge slot (flag)

### 17.4 Phase 17 gate
- [ ] Demo catalog browsable on physical device/emulator
- [ ] Light + dark checked on product photos

---

# PHASE 18 — Mobile — Calculator, rate history, size guide

**Goal:** Core trust tools complete.  
**Refs:** [11](./11_MOBILE_APP_SCREENS.md)

### 18.1 Calculator
- [ ] Rate card
- [ ] Purity, weight, making %, GST %
- [ ] Breakup + total (prefer `/calculator/quote`)
- [ ] Reset

### 18.2 Rate history
- [ ] Chart + list
- [ ] Purity series selector

### 18.3 Size guide
- [ ] Ring / bangle / necklace charts
- [ ] Estimator inputs
- [ ] Entry from Account + item detail when relevant

### 18.4 Phase 18 gate
- [ ] Calculator matches admin-visible rates
- [ ] History updates after new admin rate

---

# PHASE 19 — Mobile — Auth, account, wishlist, enquire, WhatsApp

**Goal:** Logged-in customer journeys.  
**Refs:** [11](./11_MOBILE_APP_SCREENS.md) · [13](./13_END_TO_END_FLOWS.md) Flows 2, 7, 8

### 19.1 Auth UI
- [ ] Phone screen
- [ ] OTP screen + resend cooldown + autofill if possible
- [ ] Soft-login sheet with returnTo
- [ ] Token persist + silent refresh

### 19.2 Account
- [ ] Account hub rows (feature-aware)
- [ ] Theme mode setting
- [ ] About retailer
- [ ] Logout

### 19.3 Wishlist / enquiries / custom requests
- [ ] Wishlist list + toggle sync
- [ ] Enquire sheet → API
- [ ] My enquiries list
- [ ] Custom request form + uploads (if flag)

### 19.4 WhatsApp
- [ ] `wa.me` CTAs when FEATURE_WHATSAPP (item, maybe calculator share text)

### 19.5 Phase 19 gate
- [ ] Full Flow 2 + 7 + 8 on Demo
- [ ] Guest browse still works

---

# PHASE 20 — Chat Phase A — API + Admin + Mobile

**Goal:** Real Chat tab, not placeholder.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) §5 · [09](./09_BACKEND_API.md) · [10](./10_ADMIN_WEB_PAGES.md) · [11](./11_MOBILE_APP_SCREENS.md) · [13](./13_END_TO_END_FLOWS.md) Flow 9

### 20.1 API
- [ ] Threads create/list
- [ ] Messages list/send with clientMessageId idempotency
- [ ] Read receipts / unread counters
- [ ] Admin inbox list + status patch
- [ ] AuthZ: customer owns thread; staff all threads
- [ ] Message rate limit
- [ ] requireFeature('CHAT')

### 20.2 Admin UI
- [ ] `/chat` list + `/chat/[threadId]` pane
- [ ] Composer + attachments
- [ ] Polling/refresh
- [ ] Status controls

### 20.3 Mobile UI
- [ ] Chat tab (flag on)
- [ ] Thread list + unread badges
- [ ] Conversation screen
- [ ] Start from item detail
- [ ] Attachments via signed upload

### 20.4 Phase 20 gate
- [ ] Two-way chat Demo admin ↔ mobile
- [ ] No cross-customer thread access (negative test)
- [ ] Flag off hides tab + returns 403 on API

---

# PHASE 21 — Push notifications (FCM)

**Goal:** Rate/chat/arrival nudges.  
**Refs:** [02](./02_AUTH_AND_SECURITY.md) · [11](./11_MOBILE_APP_SCREENS.md) · [13](./13_END_TO_END_FLOWS.md) Flow 11

### 21.1 Backend
- [ ] Firebase Admin setup per env
- [ ] `POST /devices` / DELETE
- [ ] `POST /rates/notify`
- [ ] New arrival notify hook
- [ ] Chat message FCM nudge (opaque ids only)

### 21.2 Mobile
- [ ] FlutterFire setup per flavor
- [ ] Permission priming screen
- [ ] Handlers for rates_updated / chat_message / new_arrival
- [ ] Token refresh registration

### 21.3 Admin
- [ ] Notify checkbox on rates actually sends

### 21.4 Phase 21 gate
- [ ] Test device receives rate notification
- [ ] Chat nudge received while app backgrounded

---

# PHASE 22 — Launch modules (Hallmark, Offers, polish)

**Goal:** Launch-flag features + catalog UX polish.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) · [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)

### 22.1 Hallmark (if sold / flag)
- [ ] Admin fields HUID + stamp image + BIS on branding
- [ ] Mobile trust badge + BIS Care copy
- [ ] No fake “verified” claims

### 22.2 Offers
- [ ] Mobile offers list/entry from account/home if flag
- [ ] Scheduling respected on public GET

### 22.3 Catalog polish
- [ ] Clone item (admin)
- [ ] Category sort order UI
- [ ] Better filters (purity/metal/new/featured)
- [ ] Recently viewed (local) optional
- [ ] Trust strip on About/Home from shop_config

### 22.4 CSV import (strongly recommended before Ratnaraj catalog load)
- [ ] `POST /items/import` + admin upload UI
- [ ] Template CSV documented

### 22.5 Phase 22 gate
- [ ] All Ratnaraj launch flags have UI+API behavior
- [ ] Flags off → no dead UI

---

# PHASE 23 — Legal, privacy, account deletion, Play readiness

**Goal:** Store-compliant app.  
**Refs:** [06](./06_LEGAL_AND_COMPLIANCE.md) · [13](./13_END_TO_END_FLOWS.md) Flow 12

### 23.1 Policies
- [ ] Privacy policy page hosted (Demo URL; client URL later)
- [ ] Terms of use page
- [ ] In-app links Account → Privacy
- [ ] Play Data safety disclosures drafted

### 23.2 Account deletion
- [ ] Mobile delete UI + confirm
- [ ] API anonymize/soft-delete + revoke sessions + deactivate devices
- [ ] Store listing delete-account instruction

### 23.3 Permissions audit
- [ ] Only required Android permissions
- [ ] Camera only if attachments need it; justify in Play form

### 23.4 Phase 23 gate
- [ ] Delete account Flow 12 passes
- [ ] Policy URLs open on device

---

# PHASE 24 — Production hardening

**Goal:** Operable system, not just features.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md) §1 · [09](./09_BACKEND_API.md)

### 24.1 Reliability
- [ ] Structured logging with requestId
- [ ] Sentry (or similar) for API + admin + mobile (Demo DSNs)
- [ ] Atlas backup enabled + restore notes documented
- [ ] Post-deploy smoke script (health, public config, login)
- [ ] Force/soft update mechanism planned (remote min version in config)

### 24.2 Security review pass
- [ ] Re-check [02](./02_AUTH_AND_SECURITY.md) checklist
- [ ] CORS locked
- [ ] Rate limits on OTP/auth/chat verified
- [ ] No secrets in app binaries (flavor review)

### 24.3 Performance
- [ ] Pagination on items/messages
- [ ] Cloudinary transforms for thumbs
- [ ] Indexes confirmed under sample load

### 24.4 Phase 24 gate
- [ ] Smoke script green on Demo Render deploy
- [ ] Backup/restore note stored in docs or ops folder

---

# PHASE 25 — Demo Jewellers dogfood & QA sign-off

**Goal:** Template proven before client data.  
**Refs:** [13](./13_END_TO_END_FLOWS.md) §18 · [05](./05_BUILD_ROADMAP.md) DoD

### 25.1 Deploy Demo
- [ ] Render free/starter for Demo API
- [ ] Vercel Hobby admin
- [ ] Atlas Demo DB
- [ ] Cloudinary Demo folder
- [ ] MSG91 Demo sender
- [ ] Internal Play track OR APK distribution for testers

### 25.2 Full integration script
- [ ] Admin login
- [ ] Set rate + notify
- [ ] Create category/sub/item + images
- [ ] Mobile sees rate + item
- [ ] OTP login
- [ ] Wishlist + enquire
- [ ] Chat both directions
- [ ] WhatsApp CTA (if on)
- [ ] Logout + delete disposable user
- [ ] Staff cannot open branding
- [ ] Light/dark visual QA
- [ ] Mid-range Android device test

### 25.3 Bug bash
- [ ] Bug list filed and P0/P1 fixed
- [ ] Known P2 deferred logged

### 25.4 Phase 25 gate
- [ ] Written QA sign-off (“Demo ready for sales + template baseline”)
- [ ] 10-minute demo script written ([08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md))

---

# PHASE 26 — Ratnaraj provisioning & data load

**Goal:** Client stack live with real branding/catalog.  
**Refs:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) §7 · [13](./13_END_TO_END_FLOWS.md) Flow 14

### 26.1 Provision (client-owned)
- [ ] Atlas project/cluster
- [ ] Render Starter web service + env (flags per quote)
- [ ] Vercel admin project
- [ ] Cloudinary
- [ ] MSG91 with shop sender where possible
- [ ] Firebase project for their flavor
- [ ] Seed owner credentials delivered securely

### 26.2 Branding & flavor
- [ ] Ratnaraj tokens + logo in shop_config
- [ ] Flutter flavor icons/splash/name/API URL finalized
- [ ] Feature flags match signed quote

### 26.3 Data
- [ ] Categories/subcategories loaded
- [ ] Items imported (CSV or manual) with good photos
- [ ] First real rates entered
- [ ] About/contact/GST verified

### 26.4 Phase 26 gate
- [ ] Smoke script green on Ratnaraj stack
- [ ] Owner can log into admin without developer

---

# PHASE 27 — Play Store submit & testing

**Goal:** App on client’s Play Console.  
**Refs:** [06](./06_LEGAL_AND_COMPLIANCE.md)

### 27.1 Build pipeline
- [ ] Signing key / Play App Signing under **client** control
- [ ] Codemagic/CI produces signed AAB for `ratnaraj` flavor
- [ ] VersionCode/versionName scheme documented

### 27.2 Store listing
- [ ] Title, short/long description
- [ ] Screenshots (phone)
- [ ] Icon / feature graphic
- [ ] Privacy policy URL (client domain or approved host)
- [ ] Data safety form
- [ ] Content rating questionnaire

### 27.3 Tracks
- [ ] Internal testing → closed testing → production (as agreed)
- [ ] Testers list includes shop owner phone

### 27.4 Phase 27 gate
- [ ] Owner installs from Play testing track
- [ ] End-to-end smoke on production API from store build

---

# PHASE 28 — Retailer training & ownership handoff

**Goal:** Client runs day-to-day without you.  
**Refs:** [06](./06_LEGAL_AND_COMPLIANCE.md) §8

### 28.1 Training
- [ ] Train: set rates + notify
- [ ] Train: add/edit items + photos
- [ ] Train: enquiries + chat reply
- [ ] Train: branding basics (owner)
- [ ] Loom/PDF quick guides delivered

### 28.2 Handoff
- [ ] Client is owner on Play Console
- [ ] Client access: Render, Vercel, Atlas, Cloudinary, MSG91, Firebase
- [ ] Temporary developer access time-boxed or removed
- [ ] Keystore/signing acknowledged
- [ ] Module flags vs invoice confirmed
- [ ] Support channel + AMC terms confirmed
- [ ] Client version register entry (`template@x.y.z`)

### 28.3 Phase 28 gate
- [ ] Handoff checklist all boxes ticked
- [ ] Owner updates a rate solo successfully

---

# PHASE 29 — Post-launch stabilize & AMC baseline

**Goal:** Fix real-world issues; freeze Launch package.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md) Month 5

### 29.1 Stabilize
- [ ] Triage crash/Sentry issues
- [ ] OTP delivery issues monitored (MSG91 balance alerts explained to client)
- [ ] Catalog/photo quality feedback loop
- [ ] Chat UX fixes (canned replies if needed)
- [ ] Performance fixes from real usage

### 29.2 Product freeze for Launch
- [ ] Tag `template@1.0.0` (or equivalent)
- [ ] Changelog started
- [ ] Upsell list prepared (billing, QR, old-gold, realtime chat)

### 29.3 Phase 29 gate
- [ ] 2 weeks production without P0 open (or accepted)
- [ ] AMC invoice/process ready

---

# PHASE 30 — Monetization modules

**Goal:** Paid modules implementable and sellable.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) · [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)

### 30.1 Digital billing (`FEATURE_DIGITAL_BILLING`)
- [ ] Invoice create + PDF + Cloudinary store
- [ ] Admin UI + share link / WhatsApp
- [ ] CA/GST field review note

### 30.2 Razorpay (`FEATURE_RAZORPAY_PAYMENTS`)
- [ ] Create order server-side
- [ ] Webhook verify
- [ ] Mobile/admin pay UX for advance/booking
- [ ] Admin payments list

### 30.3 Old-gold exchange (`FEATURE_OLD_GOLD_EXCHANGE`)
- [ ] Calculator UI + deduction % config
- [ ] Optional history per customer

### 30.4 Chat Realtime upgrade (optional paid)
- [ ] Socket.IO/WebSocket on same models
- [ ] Admin + mobile wired

### 30.5 Phase 30 gate
- [ ] Each module demoable on Demo with flag toggle
- [ ] Quote sheet updated with real prices

---

# PHASE 31 — Showroom bridge

**Goal:** Physical store ↔ app loop.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)

### 31.1 QR & deep links (`FEATURE_ITEM_QR`)
- [ ] Deep link to `/items/sku/:sku`
- [ ] Generate QR per item
- [ ] Printable tag PDF (SKU, purity, weight, QR)

### 31.2 Share rate card (`FEATURE_SHARE_RATE_CARD`)
- [ ] Image/PDF generate + share sheet

### 31.3 Appointments (`FEATURE_APPOINTMENTS`)
- [ ] Customer booking form
- [ ] Admin calendar/list

### 31.4 Store mode / curated boards (as sold)
- [ ] Tablet-friendly catalog mode
- [ ] Curated Home boards

### 31.5 Phase 31 gate
- [ ] Scan QR on printed tag opens item in app/store build
- [ ] Demo script includes showroom flow

---

# PHASE 32 — Growth pack

**Goal:** Retention & retailer ROI proof.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)

### 32.1 CRM-lite (`FEATURE_CRM_LIGHT`)
- [ ] Customer tags
- [ ] Follow-up reminders on old enquiries

### 32.2 Analytics (`FEATURE_ANALYTICS`)
- [ ] feature_events writes from app
- [ ] Admin dashboard charts (views, wishlists, enquiries)

### 32.3 Schemes / referrals / price alerts
- [ ] `FEATURE_SCHEMES`
- [ ] `FEATURE_REFERRALS`
- [ ] `FEATURE_PRICE_ALERTS`

### 32.4 Phase 32 gate
- [ ] Retailer can see a simple “most viewed items” report
- [ ] Flags documented in [04](./04_FEATURES_AND_MODULES.md) if newly added

---

# PHASE 33 — Second-client automation & onboarding kit

**Goal:** White-label becomes repeatable.  
**Refs:** [07](./07_FUTURE_AND_UPSCALING.md) · [01](./01_PRODUCT_AND_ARCHITECTURE.md)

### 33.1 Automation
- [ ] `create-client --slug` script (flavor folder, env template)
- [ ] Codemagic multi-flavor pipeline
- [ ] Per-client migrate + smoke
- [ ] Client version register maintained

### 33.2 Onboarding kit
- [ ] One-day checklist PDF (from real Ratnaraj timings)
- [ ] Sales demo on Demo Jewellers
- [ ] 48-hour reskin preview process documented

### 33.3 Client #2
- [ ] Execute checklist end-to-end
- [ ] Measure hours vs Client #1
- [ ] Update kit with friction points

### 33.4 Phase 33 gate
- [ ] Client #2 live (or internal dry-run fully timed)
- [ ] Onboarding kit v1 published internally

---

# PHASE 34 — Premium messaging & rate API

**Goal:** Premium tier real.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) · [07](./07_FUTURE_AND_UPSCALING.md)

### 34.1 WhatsApp Business API (`FEATURE_WHATSAPP_BUSINESS_API`)
- [ ] BSP/provider setup guide for client
- [ ] Morning rate broadcast
- [ ] Offer broadcast

### 34.2 Automated rates (`FEATURE_RATE_API`)
- [ ] Provider integration + retailer margin
- [ ] Fallback to manual
- [ ] Cost disclosed to client

### 34.3 Optional differentiators (only if sold)
- [ ] Offline catalog
- [ ] i18n (Hindi first)
- [ ] Multi-branch
- [ ] Savings scheme tracker

### 34.4 Phase 34 gate
- [ ] Premium demo path on Demo flags
- [ ] Pricing updated

---

# PHASE 35 — Year-1 closeout & roadmap refresh

**Goal:** Product company rhythm.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md) §6–8

### 35.1 Review
- [ ] Which modules actually sold? Keep/kill list
- [ ] Update decision log in [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)
- [ ] Case study (with Ratnaraj permission)
- [ ] AMC Bronze/Silver/Gold prices published
- [ ] Draft next-year master plan phases (copy this file → v2)

### 35.2 Engineering hygiene
- [ ] Dependency updates
- [ ] Security audit pass
- [ ] Docs 01–14 still accurate (fix drift)

### 35.3 Phase 35 gate
- [ ] All Launch–Growth promises reconciled with reality
- [ ] Team agrees v2 priorities in writing

---

## Cross-phase definition of done — First production client (Ratnaraj)

Use after Phase 28. Must all be true:

- [ ] Dedicated Atlas + Render Starter + Vercel + Cloudinary under client ownership model
- [ ] Flavor AAB on client Play Console (testing or production)
- [ ] Owner sets rates & manages catalog without developer
- [ ] Customer: browse, calculate, OTP, wishlist, enquire
- [ ] Chat works if sold/flagged ON
- [ ] Feature flags match invoice
- [ ] Privacy + account deletion live
- [ ] Keystore/secrets ownership documented
- [ ] Training completed
- [ ] This master plan Phases 01–28 marked ✅ or ⏸ with reasons

---

## Deferred log

| Date | Item | From phase | Reason | Target phase |
|---|---|---|---|---|
| | | | | |

---

## Quick reference — doc map

| Need | Doc |
|---|---|
| Architecture / deploy / costs | [01](./01_PRODUCT_AND_ARCHITECTURE.md) |
| Security | [02](./02_AUTH_AND_SECURITY.md) |
| Schemas | [03](./03_DATA_MODEL.md) |
| Modules & pricing | [04](./04_FEATURES_AND_MODULES.md) |
| Short roadmap | [05](./05_BUILD_ROADMAP.md) |
| Legal | [06](./06_LEGAL_AND_COMPLIANCE.md) |
| Upscaling | [07](./07_FUTURE_AND_UPSCALING.md) |
| Enhancements / months / ideas | [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md) |
| API routes | [09](./09_BACKEND_API.md) |
| Admin pages | [10](./10_ADMIN_WEB_PAGES.md) |
| Mobile screens | [11](./11_MOBILE_APP_SCREENS.md) |
| Design | [12](./12_DESIGN_SYSTEM.md) |
| E2E flows | [13](./13_END_TO_END_FLOWS.md) |
| **Execute here** | **This file (14)** |

---

## How to start tomorrow

1. Open Phase **01** — tick intake & commercial items.  
2. Start Phase **02** wireframes in parallel if intake assets exist.  
3. Do not write feature UI before Phase **03–06** foundations exist.  
4. Update the progress tracker table at the top every checkpoint.  
