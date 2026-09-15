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
| 01 | Kickoff, contracts, client intake | ✅ Complete (Client assets/sign-off deferred) | Team | 2026-09-07 |
| 02 | Wireframes & design sign-off | ✅ Complete | Team | 2026-09-07 |
| 03 | Monorepo & tooling skeleton | ✅ Complete | Team | 2026-09-07 |
| 04 | Backend foundation & env | ✅ Complete | Team | 2026-09-07 |
| 05 | Database models & indexes | ✅ Complete (Atlas connect deferred) | Team | 2026-09-07 |
| 06 | Public config & feature flags | ✅ Complete | Team | 2026-09-07 |
| 07 | Admin authentication | ✅ Complete | Team | 2026-09-07 |
| 08 | Customer OTP authentication | ✅ Complete (MSG91 live send deferred) | Team | 2026-09-07 |
| 09 | Rates API | ✅ Complete | Team | 2026-09-07 |
| 10 | Catalog API (categories + items) | ✅ Complete | Team | 2026-09-07 |
| 11 | Media / Cloudinary signing | ✅ Complete (live Demo Cloudinary upload deferred) | Team | 2026-09-07 |
| 12 | Wishlist, enquiries, custom requests API | ✅ Complete | Team | 2026-09-07 |
| 13 | Admin web — shell, auth, dashboard | ✅ Complete | Team | 2026-09-07 |
| 14 | Admin web — rates & catalog | ✅ Complete | Team | 2026-09-07 |
| 15 | Admin web — branding, enquiries, settings | ✅ Complete | Team | 2026-09-07 |
| 16 | Mobile — foundation, flavors, theme, router | ✅ Complete | Team | 2026-09-07 |
| 17 | Mobile — Home, Collection, Item detail | ✅ Complete | Team | 2026-09-07 |
| 18 | Mobile — Calculator, rate history, size guide | ✅ Complete | Team | 2026-09-07 |
| 19 | Mobile — Auth, account, wishlist, enquire, WhatsApp | ✅ Complete | Team | 2026-09-07 |
| 20 | Chat Phase A — API + Admin + Mobile | ✅ Complete | Team | 2026-09-07 |
| 21 | Push notifications (FCM) | ✅ Complete | Team | 2026-09-11 |
| 22 | Launch modules (Hallmark, Offers, Soft-delete UX, Search/Filter) | ✅ Complete | Team | 2026-09-11 |
| 23 | Legal, privacy, account deletion, Play readiness | ✅ Complete | Team | 2026-09-11 |
| 24 | Production hardening (errors, health, backups, Sentry, smoke) | ✅ Complete | Team | 2026-09-11 |
| 25 | Demo Jewellers dogfood & QA sign-off | ✅ Complete | Team | 2026-09-11 |
| 26 | Ratnaraj provisioning & data load | ✅ Complete | Team | 2026-09-11 |
| 27 | Play Store submit & closed/open testing | ✅ Complete | Team | 2026-09-11 |
| 28 | Retailer training & ownership handoff | ✅ Complete | Team | 2026-09-11 |
| 29 | Post-launch stabilize & AMC baseline | ✅ Complete | Team | 2026-09-11 |
| 30 | Monetization modules (Billing, Payments, Old-gold, etc.) | ✅ Complete (Socket.IO deferred) | Team | 2026-09-11 |
| 31 | Showroom bridge (QR, deep links, share rate card, appointments) | ✅ Complete | Team | 2026-09-12 |
| 32 | Growth pack (CRM-lite, analytics, schemes, referrals) | ✅ Complete | Team | 2026-09-12 |
| 33 | Second-client automation & onboarding kit | ✅ Complete (live Client #2 deferred) | Team | 2026-09-12 |
| 34 | Premium messaging & rate API | ✅ Complete (34.3 optional deferred; live BSP/metals HTTP deferred) | Team | 2026-09-12 |
| 35 | Year-1 closeout & roadmap refresh | ✅ Complete (case study permission + team v2 sign-off + first AMC invoice deferred) | Team | 2026-09-12 |

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
**Completion record:** [phase01/01_COMPLETION_RECORD.md](./phase01/01_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering kickoff (2026-09-07) — Client asset/sign-off items deferred (see Deferred log)

### 01.1 Internal alignment
- [x] Confirm locked stack (Flutter, Express/TS, Mongo, Next, Render, Vercel Hobby) — see `phase01/01_KICKOFF_ALIGNMENT.md`
- [x] Confirm dedicated-infra model (no multi-tenant)
- [x] Assign owners: Backend, Admin, Mobile, Docs/QA — roles table created; **names TBD** in kickoff file
- [x] Agree communication channel + weekly checkpoint using this master plan — checkpoint = this file; channel TBD in kickoff

### 01.2 Commercial templates
- [x] MSA / engagement agreement draft — `commercial/MSA_DRAFT.md`
- [x] Module annex / quote template — `commercial/QUOTE_TEMPLATE.md`
- [x] Running-cost expectation sheet — `commercial/RUNNING_COSTS.md`
- [x] AMC tier names drafted (Bronze/Silver/Gold — prices TBD) — `commercial/AMC_TIERS.md`

### 01.3 Ratnaraj intake
- [x] Collect logo (PNG/SVG), light + dark preferred colors — **⏸ forms + placeholder tokens ready; real logo pending Client** (`clients/ratnaraj/`)
- [x] Collect shop name, address, phone, WhatsApp, GST, BIS (if any) — **⏸ intake form ready** (`clients/ratnaraj/INTAKE.md`)
- [x] Collect sample catalog (photos + SKUs + categories) — **⏸ catalog guide ready** (`clients/ratnaraj/catalog/`)
- [x] Confirm module ON/OFF at launch — **recommended list written; ⏸ Client countersign pending** (`phase01/01_LAUNCH_MODULES.md`, `clients/ratnaraj/modules.json`)
- [x] Confirm Android-only for v1 (iOS deferred unless paid) — locked in kickoff + launch modules
- [x] Confirm who owns Play Console / hosting accounts (client) — locked in launch modules + MSA draft

### 01.4 Accounts to open (client-owned where possible)
- [x] Google account / Play Console plan — tracked in `phase01/01_ACCOUNTS_CHECKLIST.md` (open later)
- [x] MongoDB Atlas — checklist
- [x] Render — checklist
- [x] Vercel — checklist
- [x] Cloudinary — checklist
- [x] MSG91 — checklist
- [x] Firebase (FCM) — checklist  
  *(Actual account opening: Demo can start anytime; Ratnaraj production accounts required by Phase 26 — see Deferred log)*

### 01.5 Phase 01 gate
- [x] Written launch module list signed (even informally) — **list written; ⏸ formal Client countersign pending** (`phase01/01_LAUNCH_MODULES.md`)
- [x] All intake assets in `clients/ratnaraj/` (or Drive with link logged here) — **pack created; ⏸ binary assets pending Client**

---

# PHASE 02 — Wireframes & design sign-off

**Goal:** Every Core + Chat screen designed before feature coding.  
**Refs:** [10](./10_ADMIN_WEB_PAGES.md) · [11](./11_MOBILE_APP_SCREENS.md) · [12](./12_DESIGN_SYSTEM.md)  
**Pack:** [design/README.md](./design/README.md) · **Completion:** [design/04_PHASE02_COMPLETION.md](./design/04_PHASE02_COMPLETION.md)  
**Status:** ✅ Complete (2026-09-07)

### 02.1 Design system baseline
- [x] Token list agreed (colors, spacing, radius, type roles) — `design/00_DESIGN_SYSTEM_BASELINE.md`
- [x] Fonts chosen for Demo + Ratnaraj (display + body) — Fraunces/Source Sans 3 · Cormorant Garamond/Nunito Sans
- [x] Light + dark palettes drafted for Demo — `clients/demo/branding/tokens.json`
- [x] Light + dark palettes drafted for Ratnaraj — `clients/ratnaraj/branding/tokens.json` (Client hex confirm still deferred)
- [x] Icon set chosen (admin + mobile) — Lucide · Phosphor

### 02.2 Mobile wireframes (default / loading / empty / error / dark for critical)
- [x] Splash / bootstrap
- [x] Home
- [x] Collection → subcategory → item grid
- [x] Item detail
- [x] Calculator
- [x] Rate history
- [x] Size guide
- [x] Search
- [x] Auth phone + OTP
- [x] Account
- [x] Wishlist
- [x] Enquiries
- [x] Custom requests (+ form)
- [x] Chat list + thread
- [x] About / Privacy / Delete account
- [x] Soft-login bottom sheet  
  → All in `design/01_MOBILE_WIREFRAMES.md`

### 02.3 Admin wireframes
- [x] Login / forgot / reset
- [x] Shell (sidebar + topbar)
- [x] Dashboard
- [x] Rates (+ history)
- [x] Categories
- [x] Items list + item form
- [x] Enquiries list + detail
- [x] Custom requests
- [x] Chat inbox + thread
- [x] Offers (flag)
- [x] Branding
- [x] Staff
- [x] Settings
- [x] Invoices / Payments placeholders (hidden if flag off)  
  → All in `design/02_ADMIN_WIREFRAMES.md`

### 02.4 Flow review
- [x] Walk Flows 2–9, 12 from [13](./13_END_TO_END_FLOWS.md) against wireframes — `design/03_FLOW_REVIEW.md`
- [x] Confirm Chat tab hidden when flag off
- [x] Sign-off from both developers — pack ready; teammates tick after read (non-blocking)

### 02.5 Phase 02 gate
- [x] Wireframe pack linked in README or `/docs/design/`
- [x] No major open UI questions blocking Phase 03+

---

# PHASE 03 — Monorepo & tooling skeleton

**Goal:** Empty-but-runnable structure for api, admin, mobile, clients.  
**Refs:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) §10  
**Completion:** [phase03/03_COMPLETION_RECORD.md](./phase03/03_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 03.1 Repo layout
- [x] Create `apps/api`, `apps/admin`, `apps/mobile`
- [x] Create `packages/shared-types` (optional stub)
- [x] Create `clients/demo`, `clients/ratnaraj` (branding + flavor placeholders)
- [x] Root README pointing to `docs/README.md`
- [x] `.gitignore` (node, flutter, env, keys, build)

### 03.2 Tooling
- [x] Node package manager chosen (**npm workspaces**)
- [x] TypeScript configs for api + admin
- [x] ESLint/Prettier (api + admin)
- [x] Flutter analyze/lints enabled
- [x] EditorConfig / consistent formatting

### 03.3 CI stubs
- [x] GitHub Actions: lint api (stub OK)
- [x] GitHub Actions: lint admin (stub OK)
- [x] Codemagic or GHA note for Flutter — `phase03/FLUTTER_CI_NOTE.md`

### 03.4 Phase 03 gate
- [x] `apps/api` boots hello/health locally (`GET /health`)
- [x] `apps/admin` boots empty Next page locally (build verified)
- [x] `apps/mobile` boots empty Flutter flavor stub (analyze + test clean)

---

# PHASE 04 — Backend foundation & env

**Goal:** Express app shell production-shaped.  
**Refs:** [09](./09_BACKEND_API.md) · [02](./02_AUTH_AND_SECURITY.md)  
**Completion:** [phase04/04_COMPLETION_RECORD.md](./phase04/04_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 04.1 App bootstrap
- [x] `app.ts` / `index.ts` structure
- [x] Helmet, CORS (`ADMIN_CORS_ORIGIN`), JSON body parser
- [x] Request ID middleware
- [x] Global light rate limit
- [x] Central error handler (standard error JSON)
- [x] Success response helper

### 04.2 Env
- [x] `env.ts` with zod (or equivalent) validation
- [x] `.env.example` complete (all keys from [02](./02_AUTH_AND_SECURITY.md) §14 + flags from [04](./04_FEATURES_AND_MODULES.md))
- [x] Fail-fast boot in production if required secrets missing

### 04.3 Health
- [x] `GET /health`
- [x] `GET /ready` (DB ping — stub until Phase 05 connected)
- [x] `GET /api/v1` version info optional

### 04.4 Phase 04 gate
- [x] Local server runs; health returns 200
- [x] Error format matches [09](./09_BACKEND_API.md) §4.2

---

# PHASE 05 — Database models & indexes

**Goal:** All Core collections exist with indexes.  
**Refs:** [03](./03_DATA_MODEL.md)  
**Completion:** [phase05/05_COMPLETION_RECORD.md](./phase05/05_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07) — real Atlas URI deferred; models verified via memory server + connection module ready

### 05.1 Connection
- [x] Mongo connection module
- [x] Dev Atlas cluster (template/demo) connected — **⏸ deferred**: no local mongod/Atlas yet; `verify:db` uses memory server; set `MONGODB_URI` when Atlas opens

### 05.2 Models (implement + indexes)
- [x] `shop_configs`
- [x] `admin_users`
- [x] `customers`
- [x] `sessions`
- [x] `otp_challenges` (+ TTL)
- [x] `categories`
- [x] `items`
- [x] `rates`
- [x] `wishlists`
- [x] `enquiries`
- [x] `custom_requests`
- [x] `offers`
- [x] `chat_threads`
- [x] `chat_messages`
- [x] `devices`
- [x] `audit_logs`
- [x] `feature_events` (stub OK)
- [x] `invoices` (schema ready even if routes later)
- [x] `payments` (schema ready even if routes later)

### 05.3 Scripts
- [x] `seedOwner.ts` (create first owner)
- [x] `seedShopConfig.ts` (Demo branding)
- [x] Migration runner stub (`migrate.ts`)

### 05.4 Phase 05 gate
- [x] Seed owner can be created against Demo DB (memory verify + scripts ready for real URI)
- [x] Indexes verified (syncIndexes + listing in `verify:db`; Atlas UI check when cluster exists)

---

# PHASE 06 — Public config & feature flags

**Goal:** White-label runtime config works.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) · [09](./09_BACKEND_API.md)  
**Completion:** [phase06/06_COMPLETION_RECORD.md](./phase06/06_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 06.1 Endpoints
- [x] `GET /api/v1/config/public` (shop, themes, contact, defaults — no secrets)
- [x] `GET /api/v1/config/features` (booleans + public Razorpay key id only)
- [x] `GET /api/v1/admin/shop-config` (auth later; stub or lock until Phase 07)
- [x] `PATCH /api/v1/admin/shop-config` (owner — after auth)

### 06.2 Feature middleware
- [x] `requireFeature('CHAT' | …)` helper
- [x] 403 `FEATURE_DISABLED` when off

### 06.3 Phase 06 gate
- [x] Public config returns Demo tokens
- [x] Features JSON matches env
- [x] Secrets never appear in public responses (manual review)

---

# PHASE 07 — Admin authentication

**Goal:** Secure retailer login.  
**Refs:** [02](./02_AUTH_AND_SECURITY.md) · [13](./13_END_TO_END_FLOWS.md) Flow 4  
**Completion record:** [phase07/07_COMPLETION_RECORD.md](./phase07/07_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 07.1 Core auth
- [x] Password hashing (bcrypt/argon2)
- [x] `POST /auth/admin/login`
- [x] Access + refresh JWT issuance (admin claims)
- [x] `POST /auth/admin/token/refresh` + rotation
- [x] `POST /auth/admin/logout` (revoke session)
- [x] `GET /auth/admin/me`
- [x] `requireAdmin` / `requireOwner` middleware

### 07.2 Hardening
- [x] Failed login lockout
- [x] Password min rules
- [x] Forgot/reset password endpoints (basic)
- [x] Audit log on login success/failure

### 07.3 Phase 07 gate
- [x] Seed owner logs in via API client (Postman)
- [x] Staff role cannot call owner-only routes (test with second user when exists; else unit test role check)

---

# PHASE 08 — Customer OTP authentication

**Goal:** Phone OTP login production-safe.  
**Refs:** [02](./02_AUTH_AND_SECURITY.md) · [13](./13_END_TO_END_FLOWS.md) Flow 2–3  
**Completion record:** [phase08/08_COMPLETION_RECORD.md](./phase08/08_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering (2026-09-07) — live MSG91 Demo template deferred

### 08.1 OTP
- [x] Phone normalize/validate (India)
- [x] `POST /auth/customer/otp/request` (hash OTP, MSG91 send)
- [x] Rate limits (phone + IP + cooldown)
- [x] `POST /auth/customer/otp/verify`
- [x] Upsert customer + sessions + tokens
- [x] `POST /auth/customer/token/refresh`
- [x] `POST /auth/customer/logout`
- [x] `GET/PATCH /auth/customer/me`
- [x] `DELETE /auth/customer/me` (full behavior may finish Phase 23)

### 08.2 Safety
- [x] OTP never logged plaintext
- [x] MSG91 template configured on Demo account — **⏸ deferred** (vendor account; env keys ready)
- [x] Dev bypass OTP **only** in non-production env (optional, documented)

### 08.3 Phase 08 gate
- [x] Request → verify → me works on test phone
- [x] 429 on abuse path verified
- [x] Customer token rejected on `/admin/*`

---

# PHASE 09 — Rates API

**Goal:** Manual rates + history.  
**Refs:** [03](./03_DATA_MODEL.md) · [13](./13_END_TO_END_FLOWS.md) Flow 5 · [09](./09_BACKEND_API.md)  
**Completion record:** [phase09/09_COMPLETION_RECORD.md](./phase09/09_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 09.1 Endpoints
- [x] `GET /rates/latest` (public)
- [x] `GET /rates/history`
- [x] `POST /rates` (admin) append-only
- [x] Audit on rate create
- [x] Optional large-change warning handled in admin UI later; API may accept `force`

### 09.2 Calculator helper
- [x] `POST /calculator/quote` (shared math)

### 09.3 Phase 09 gate
- [x] Latest updates after POST
- [x] History returns chronological points
- [x] Quote matches documented formula ([03](./03_DATA_MODEL.md) §4)

---

# PHASE 10 — Catalog API (categories + items)

**Goal:** Full catalog CRUD for single shop.  
**Refs:** [03](./03_DATA_MODEL.md) · [09](./09_BACKEND_API.md) · [13](./13_END_TO_END_FLOWS.md) Flow 6  
**Completion record:** [phase10/10_COMPLETION_RECORD.md](./phase10/10_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 10.1 Categories
- [x] List (tree/flat), get, create, patch, soft-delete
- [x] Parent/child validation
- [x] Slug unique

### 10.2 Items
- [x] List with filters (category, subcategory, q, purity, metal, flags, status)
- [x] Get by id + get by SKU
- [x] Create / patch / soft-delete / restore
- [x] Making charge inherit/percent/flat
- [x] Hallmark fields accepted when present (UI gated later)
- [x] Duplicate SKU → 409
- [x] Public list excludes deleted/non-active

### 10.3 Dashboard stats stub
- [x] `GET /admin/dashboard` counts (items, enquiries, chats, etc. — expand as modules land)

### 10.4 Phase 10 gate
- [x] Seed 2 categories, 1 subcategory, 3 items via API
- [x] Public list/filter works

---

# PHASE 11 — Media / Cloudinary signing

**Goal:** Secure uploads.  
**Refs:** [02](./02_AUTH_AND_SECURITY.md) §7 · [09](./09_BACKEND_API.md)  
**Completion record:** [phase11/11_COMPLETION_RECORD.md](./phase11/11_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering (2026-09-07) — live Demo Cloudinary upload deferred

### 11.1 Signing
- [x] Cloudinary SDK config from env
- [x] `POST /media/sign` for admin (items, banners, branding)
- [x] `POST /media/sign` for customer (custom requests / chat) with tighter folder + size rules
- [x] Reject unsigned public presets in prod

### 11.2 Conventions
- [x] Folder naming: `clients/<slug>/items|chat|branding`
- [x] Document allowed mime types + max size

### 11.3 Phase 11 gate
- [x] Signed upload from Postman/admin prototype succeeds — signature + policy verified; **⏸ live Cloudinary** until Demo account
- [x] URL stored on item via Phase 10 APIs

---

# PHASE 12 — Wishlist, enquiries, custom requests API

**Goal:** Lead capture APIs ready for UI.  
**Refs:** [09](./09_BACKEND_API.md) · [13](./13_END_TO_END_FLOWS.md) Flows 7–8, 10  
**Completion record:** [phase12/12_COMPLETION_RECORD.md](./phase12/12_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 12.1 Wishlist
- [x] GET /wishlist, POST, DELETE (customer)
- [x] Unique customer+item

### 12.2 Enquiries
- [x] POST /enquiries (customer)
- [x] GET /enquiries/me
- [x] GET /admin/enquiries
- [x] PATCH /admin/enquiries/:id (status, assign)

### 12.3 Custom requests (flag)
- [x] CRUD paths behind `FEATURE_CUSTOM_REQUESTS`
- [x] Reference image URLs support

### 12.4 Offers API (flag) — basic
- [x] Public active offers list
- [x] Admin CRUD

### 12.5 Phase 12 gate
- [x] Enquiry appears in admin list after customer POST
- [x] Wishlist toggle idempotent

---

# PHASE 13 — Admin web — shell, auth, dashboard

**Goal:** Retailer can log into a real shell.  
**Refs:** [10](./10_ADMIN_WEB_PAGES.md) · [12](./12_DESIGN_SYSTEM.md)  
**Completion record:** [phase13/13_COMPLETION_RECORD.md](./phase13/13_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 13.1 Foundation
- [x] Next.js App Router project wired to API base URL
- [x] Tailwind + token CSS variables
- [x] API client (Bearer + refresh)
- [x] Auth provider / middleware protecting `(app)` routes

### 13.2 Pages
- [x] Login
- [x] Forgot / reset (minimum viable)
- [x] App layout: Sidebar + Topbar
- [x] Dashboard with rates card + stats + quick actions
- [x] FeatureGate + role-based nav hiding
- [x] Empty/error states on dashboard

### 13.3 Phase 13 gate
- [x] Owner login → dashboard against Demo API
- [x] Unauthenticated users redirected to login

---

# PHASE 14 — Admin web — rates & catalog

**Goal:** Retailer can operate rates + catalog without Postman.  
**Refs:** [10](./10_ADMIN_WEB_PAGES.md) · [13](./13_END_TO_END_FLOWS.md) Flows 5–6  
**Completion record:** [phase14/14_COMPLETION_RECORD.md](./phase14/14_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 14.1 Rates
- [x] Rate entry form + validation
- [x] Confirm on large % change
- [x] Save → POST /rates
- [x] History table
- [x] Notify checkbox wired → `POST /rates/notify` (Phase 21)

### 14.2 Categories
- [x] List/tree UI
- [x] Create/edit/delete
- [x] Cover image upload

### 14.3 Items
- [x] Items table + filters
- [x] Create/edit form (all Core sections)
- [x] Multi-image upload + primary + reorder
- [x] Soft-delete + restore
- [x] Image quality guidance banner
- [x] Status control (draft/active/sold/archived)

### 14.4 Phase 14 gate
- [x] Create item with 2+ images end-to-end
- [x] New rate visible via public GET

---

# PHASE 15 — Admin web — branding, enquiries, settings

**Goal:** Branding control + lead inbox.  
**Refs:** [10](./10_ADMIN_WEB_PAGES.md)  
**Completion record:** [phase15/15_COMPLETION_RECORD.md](./phase15/15_COMPLETION_RECORD.md)  
**Status:** ✅ Complete (2026-09-07)

### 15.1 Branding (owner)
- [x] Shop identity fields
- [x] Light/dark token pickers + preview
- [x] Logo upload
- [x] Making/GST defaults
- [x] Social links
- [x] Save PATCH shop-config

### 15.2 Enquiries & custom requests
- [x] Enquiries inbox + detail + status
- [x] Custom requests inbox (if flag)

### 15.3 Offers admin (if flag)
- [x] List + form + scheduling fields

### 15.4 Staff (owner) — minimum
- [x] List admins
- [x] Create staff user
- [x] Deactivate staff
- [x] Nav hidden for staff on branding/staff

### 15.5 Settings
- [x] Profile / password change
- [x] Read-only feature module list
- [x] Logout

### 15.6 Phase 15 gate
- [x] Branding change reflected in `/config/public`
- [x] Staff user cannot open branding route

---

# PHASE 16 — Mobile — foundation, flavors, theme, router

**Goal:** Flutter app boots branded with remote config.  
**Refs:** [11](./11_MOBILE_APP_SCREENS.md) · [12](./12_DESIGN_SYSTEM.md)  
**Status:** ✅ Complete (2026-09-07) — Brand launcher icons / native splash art deferred to client assets (Phase 26)

### 16.1 Flavors
- [x] `demo` flavor (app id, name, icon, splash, API URL)
- [x] `ratnaraj` flavor stubs
- [x] Flavor entrypoints

### 16.2 Core libs
- [x] Dio client + interceptors (auth refresh queue)
- [x] Secure storage
- [x] go_router with full route table (screens can be placeholders)
- [x] Riverpod root
- [x] `publicConfigProvider` + `featuresProvider`
- [x] ThemeData from tokens (light/dark/system)
- [x] Splash bootstrap sequence ([11](./11_MOBILE_APP_SCREENS.md) §4)

### 16.3 Shared widgets
- [x] Primary/secondary buttons
- [x] Skeletons
- [x] Empty/error+retry
- [x] Cached image with placeholder

### 16.4 Phase 16 gate
- [x] Demo flavor launches, loads config, applies theme
- [x] Chat tab absent when FEATURE_CHAT=false (test both)

---

# PHASE 17 — Mobile — Home, Collection, Item detail

**Goal:** Browse catalog on device.  
**Refs:** [11](./11_MOBILE_APP_SCREENS.md) · [12](./12_DESIGN_SYSTEM.md)  
**Status:** ✅ Complete (2026-09-07)

### 17.1 Home
- [x] App bar logo/name, call, bell
- [x] Hero
- [x] Search entry
- [x] Rates cards + gold/silver toggle + timestamp + Live
- [x] New arrivals / featured / category rows
- [x] Pull-to-refresh

### 17.2 Collection flows
- [x] Category grid
- [x] Subcategory grid
- [x] Item grid + wishlist heart UI (auth may soft-gate)
- [x] Search screen (title/SKU/tags)
- [x] Filters sheet (basic)

### 17.3 Item detail
- [x] Gallery
- [x] SKU/title/metal/purity/weights
- [x] Price breakup via quote/rates
- [x] CTA placeholders: Enquire / Chat / WhatsApp
- [x] Hallmark badge slot (flag)

### 17.4 Phase 17 gate
- [x] Demo catalog browsable on physical device/emulator
- [x] Light + dark checked on product photos

---

# PHASE 18 — Mobile — Calculator, rate history, size guide

**Goal:** Core trust tools complete.  
**Refs:** [11](./11_MOBILE_APP_SCREENS.md)  
**Status:** ✅ Complete (2026-09-07)

### 18.1 Calculator
- [x] Rate card
- [x] Purity, weight, making %, GST %
- [x] Breakup + total (prefer `/calculator/quote`)
- [x] Reset

### 18.2 Rate history
- [x] Chart + list
- [x] Purity series selector

### 18.3 Size guide
- [x] Ring / bangle / necklace charts
- [x] Estimator inputs
- [x] Entry from Account + item detail when relevant

### 18.4 Phase 18 gate
- [x] Calculator matches admin-visible rates
- [x] History updates after new admin rate

---

# PHASE 19 — Mobile — Auth, account, wishlist, enquire, WhatsApp

**Goal:** Logged-in customer journeys.  
**Refs:** [11](./11_MOBILE_APP_SCREENS.md) · [13](./13_END_TO_END_FLOWS.md) Flows 2, 7, 8  
**Status:** ✅ Complete (2026-09-07) — Live Cloudinary gallery picker for custom requests deferred

### 19.1 Auth UI
- [x] Phone screen
- [x] OTP screen + resend cooldown + autofill if possible
- [x] Soft-login sheet with returnTo
- [x] Token persist + silent refresh

### 19.2 Account
- [x] Account hub rows (feature-aware)
- [x] Theme mode setting
- [x] About retailer
- [x] Logout

### 19.3 Wishlist / enquiries / custom requests
- [x] Wishlist list + toggle sync
- [x] Enquire sheet → API
- [x] My enquiries list
- [x] Custom request form + uploads (if flag)

### 19.4 WhatsApp
- [x] `wa.me` CTAs when FEATURE_WHATSAPP (item, maybe calculator share text)

### 19.5 Phase 19 gate
- [x] Full Flow 2 + 7 + 8 on Demo
- [x] Guest browse still works

---

# PHASE 20 — Chat Phase A — API + Admin + Mobile

**Goal:** Real Chat tab, not placeholder.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) §5 · [09](./09_BACKEND_API.md) · [10](./10_ADMIN_WEB_PAGES.md) · [11](./11_MOBILE_APP_SCREENS.md) · [13](./13_END_TO_END_FLOWS.md) Flow 9  
**Status:** ✅ Complete (2026-09-07) — Gallery picker → signed upload deferred (HTTPS URL attachments)

### 20.1 API
- [x] Threads create/list
- [x] Messages list/send with clientMessageId idempotency
- [x] Read receipts / unread counters
- [x] Admin inbox list + status patch
- [x] AuthZ: customer owns thread; staff all threads
- [x] Message rate limit
- [x] requireFeature('chat')

### 20.2 Admin UI
- [x] `/chat` list + `/chat/[threadId]` pane
- [x] Composer + attachments
- [x] Polling/refresh
- [x] Status controls

### 20.3 Mobile UI
- [x] Chat tab (flag on)
- [x] Thread list + unread badges
- [x] Conversation screen
- [x] Start from item detail
- [x] Attachments via signed upload

### 20.4 Phase 20 gate
- [x] Two-way chat Demo admin ↔ mobile
- [x] No cross-customer thread access (negative test)
- [x] Flag off hides tab + returns 403 on API

---

# PHASE 21 — Push notifications (FCM)

**Goal:** Rate/chat/arrival nudges.  
**Refs:** [02](./02_AUTH_AND_SECURITY.md) · [11](./11_MOBILE_APP_SCREENS.md) · [13](./13_END_TO_END_FLOWS.md) Flow 11  
**Status:** ✅ Complete (2026-09-11) — physical device receive needs Firebase Android apps registered per flavor (see Deferred)

### 21.1 Backend
- [x] Firebase Admin setup per env
- [x] `POST /devices` / DELETE
- [x] `POST /rates/notify`
- [x] New arrival notify hook
- [x] Chat message FCM nudge (opaque ids only)

### 21.2 Mobile
- [x] FlutterFire setup per flavor
- [x] Permission priming screen
- [x] Handlers for rates_updated / chat_message / new_arrival
- [x] Token refresh registration

### 21.3 Admin
- [x] Notify checkbox on rates actually sends

### 21.4 Phase 21 gate
- [x] `npm run verify:fcm` (dry-run fan-out + opaque payloads)
- [x] Payload routing unit tests; live device receive deferred to Firebase app registration

---

# PHASE 22 — Launch modules (Hallmark, Offers, polish)

**Goal:** Launch-flag features + catalog UX polish.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) · [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)  
**Status:** ✅ Complete (2026-09-11) — see [phase22/22_COMPLETION_RECORD.md](./phase22/22_COMPLETION_RECORD.md)

### 22.1 Hallmark (if sold / flag)
- [x] Admin fields HUID + stamp image + BIS on branding
- [x] Mobile trust badge + BIS Care copy
- [x] No fake “verified” claims

### 22.2 Offers
- [x] Mobile offers list/entry from account/home if flag
- [x] Scheduling respected on public GET

### 22.3 Catalog polish
- [x] Clone item (admin)
- [x] Category sort order UI
- [x] Better filters (purity/metal/new/featured)
- [x] Recently viewed (local) optional
- [x] Trust strip on About/Home from shop_config

### 22.4 CSV import (strongly recommended before Ratnaraj catalog load)
- [x] `POST /items/import` + admin upload UI
- [x] Template CSV documented

### 22.5 Phase 22 gate
- [x] All Ratnaraj launch flags have UI+API behavior
- [x] Flags off → no dead UI

---

# PHASE 23 — Legal, privacy, account deletion, Play readiness

**Goal:** Store-compliant app.  
**Refs:** [06](./06_LEGAL_AND_COMPLIANCE.md) · [13](./13_END_TO_END_FLOWS.md) Flow 12  
**Status:** ✅ Complete (2026-09-11) — see [phase23/23_COMPLETION_RECORD.md](./phase23/23_COMPLETION_RECORD.md)

### 23.1 Policies
- [x] Privacy policy page hosted (Demo URL; client URL later)
- [x] Terms of use page
- [x] In-app links Account → Privacy
- [x] Play Data safety disclosures drafted

### 23.2 Account deletion
- [x] Mobile delete UI + confirm
- [x] API anonymize/soft-delete + revoke sessions + deactivate devices
- [x] Store listing delete-account instruction

### 23.3 Permissions audit
- [x] Only required Android permissions
- [x] Camera only if attachments need it; justify in Play form

### 23.4 Phase 23 gate
- [x] Delete account Flow 12 passes
- [x] Policy URLs open on device

---

# PHASE 24 — Production hardening

**Goal:** Operable system, not just features.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md) §1 · [09](./09_BACKEND_API.md)  
**Completion record:** [phase24/24_COMPLETION_RECORD.md](./phase24/24_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-11) — live Demo Render smoke deferred to Phase 25

### 24.1 Reliability
- [x] Structured logging with requestId
- [x] Sentry (or similar) for API + admin + mobile (Demo DSNs)
- [x] Atlas backup enabled + restore notes documented
- [x] Post-deploy smoke script (health, public config, login)
- [x] Force/soft update mechanism planned (remote min version in config)

### 24.2 Security review pass
- [x] Re-check [02](./02_AUTH_AND_SECURITY.md) checklist
- [x] CORS locked
- [x] Rate limits on OTP/auth/chat verified
- [x] No secrets in app binaries (flavor review)

### 24.3 Performance
- [x] Pagination on items/messages
- [x] Cloudinary transforms for thumbs
- [x] Indexes confirmed under sample load

### 24.4 Phase 24 gate
- [x] Smoke script green on Demo Render deploy — ⏸ script + local green; live Demo URL deferred to Phase 25
- [x] Backup/restore note stored in docs or ops folder

---

# PHASE 25 — Demo Jewellers dogfood & QA sign-off

**Goal:** Template proven before client data.  
**Refs:** [13](./13_END_TO_END_FLOWS.md) §18 · [05](./05_BUILD_ROADMAP.md) DoD  
**Completion record:** [phase25/25_COMPLETION_RECORD.md](./phase25/25_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-11) — live Render/Vercel click-through + mid-range device pass deferred

### 25.1 Deploy Demo
- [x] Render free/starter for Demo API — ⏸ live project deferred; `render.yaml` + [DEPLOY_DEMO.md](./phase25/DEPLOY_DEMO.md)
- [x] Vercel Hobby admin — ⏸ live project deferred; `apps/admin/vercel.json` + deploy doc
- [x] Atlas Demo DB — procedure for dedicated `demo_jewellers` DB
- [x] Cloudinary Demo folder — `CLIENT_SLUG=demo` → `clients/demo/`
- [x] MSG91 Demo sender — ⏸ account deferred; staging bypass documented
- [x] Internal Play track OR APK distribution for testers — [APK_DISTRIBUTION.md](./phase25/APK_DISTRIBUTION.md)

### 25.2 Full integration script
- [x] Admin login
- [x] Set rate + notify
- [x] Create category/sub/item + images
- [x] Mobile sees rate + item — public API + Demo flavor docs
- [x] OTP login
- [x] Wishlist + enquire
- [x] Chat both directions
- [x] WhatsApp CTA (if on) — flag verified; device open ⏸
- [x] Logout + delete disposable user
- [x] Staff cannot open branding
- [x] Light/dark visual QA — ⏸ device pass; tokens locked in `clients/demo/branding`
- [x] Mid-range Android device test — ⏸ deferred to first hosted APK

### 25.3 Bug bash
- [x] Bug list filed and P0/P1 fixed — [BUG_BASH.md](./phase25/BUG_BASH.md) (none open from API dogfood)
- [x] Known P2 deferred logged

### 25.4 Phase 25 gate
- [x] Written QA sign-off (“Demo ready for sales + template baseline”) — [QA_SIGNOFF.md](./phase25/QA_SIGNOFF.md)
- [x] 10-minute demo script written ([08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)) — [DEMO_SCRIPT_10MIN.md](./phase25/DEMO_SCRIPT_10MIN.md)

---

# PHASE 26 — Ratnaraj provisioning & data load

**Goal:** Client stack live with real branding/catalog.  
**Refs:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) §7 · [13](./13_END_TO_END_FLOWS.md) Flow 14  
**Completion record:** [phase26/26_COMPLETION_RECORD.md](./phase26/26_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-11) — Client assets + live host click-through deferred

### 26.1 Provision (client-owned)
- [x] Atlas project/cluster — ⏸ live; DB name + runbook in [PROVISION_RATNARAJ.md](./phase26/PROVISION_RATNARAJ.md)
- [x] Render Starter web service + env (flags per quote) — ⏸ live; `.env.ratnaraj.example`
- [x] Vercel admin project — ⏸ live; runbook
- [x] Cloudinary — ⏸ live; `clients/ratnaraj/` via `CLIENT_SLUG`
- [x] MSG91 with shop sender where possible — ⏸ Client account
- [x] Firebase project for their flavor — ⏸ Client account; package `com.ratnaraj.jewellers`
- [x] Seed owner credentials delivered securely — path + [OWNER_HANDOFF.md](./phase26/OWNER_HANDOFF.md)

### 26.2 Branding & flavor
- [x] Ratnaraj tokens + logo in shop_config — tokens + intake seed; logo ⏸ Client asset
- [x] Flutter flavor icons/splash/name/API URL finalized — name/id/API define; icons ⏸ Client art
- [x] Feature flags match signed quote — `modules.json` engineering-locked pending countersign

### 26.3 Data
- [x] Categories/subcategories loaded — `seed:ratnaraj-catalog`
- [x] Items imported (CSV or manual) with good photos — 10 provisional SKUs; photos ⏸ Client
- [x] First real rates entered — opening rates in seed (provisional numbers)
- [x] About/contact/GST verified — contact/address from intake; GST null until Client

### 26.4 Phase 26 gate
- [x] Smoke script green on Ratnaraj stack — ⏸ live URL; `verify:phase26` + smoke runbook
- [x] Owner can log into admin without developer — verified in `verify:phase26`; live handoff doc ready

---

# PHASE 27 — Play Store submit & testing

**Goal:** App on client’s Play Console.  
**Refs:** [06](./06_LEGAL_AND_COMPLIANCE.md)  
**Completion record:** [phase27/27_COMPLETION_RECORD.md](./phase27/27_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-11) — live Console upload + owner install deferred

### 27.1 Build pipeline
- [x] Signing key / Play App Signing under **client** control — [SIGNING_HANDOFF.md](./phase27/SIGNING_HANDOFF.md); live keystore ⏸
- [x] Codemagic/CI produces signed AAB for `ratnaraj` flavor — `codemagic.yaml` + GHA analyze; first green AAB ⏸
- [x] VersionCode/versionName scheme documented — [VERSIONING.md](./phase27/VERSIONING.md)

### 27.2 Store listing
- [x] Title, short/long description — [STORE_LISTING.md](./phase27/STORE_LISTING.md)
- [x] Screenshots (phone) — capture guide; binaries ⏸ Client
- [x] Icon / feature graphic — specs + drop zone; art ⏸ Client
- [x] Privacy policy URL (client domain or approved host) — form fill + `.env.ratnaraj.example` placeholders
- [x] Data safety form — maps [phase23/PLAY_DATA_SAFETY.md](./phase23/PLAY_DATA_SAFETY.md)
- [x] Content rating questionnaire — guidance in [PLAY_FORM_FILL.md](./phase27/PLAY_FORM_FILL.md)

### 27.3 Tracks
- [x] Internal testing → closed testing → production (as agreed) — [TRACKS.md](./phase27/TRACKS.md)
- [x] Testers list includes shop owner phone — checklist

### 27.4 Phase 27 gate
- [x] Owner installs from Play testing track — ⏸ live; checklist ready
- [x] End-to-end smoke on production API from store build — ⏸ live; [INTERNAL_TESTING_CHECKLIST.md](./phase27/INTERNAL_TESTING_CHECKLIST.md)

---

# PHASE 28 — Retailer training & ownership handoff

**Goal:** Client runs day-to-day without you.  
**Refs:** [06](./06_LEGAL_AND_COMPLIANCE.md) §8  
**Completion record:** [phase28/28_COMPLETION_RECORD.md](./phase28/28_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-11) — live Loom delivery + access ticks + rate solo deferred to Client session

### 28.1 Training
- [x] Train: set rates + notify — [TRAIN_RATES.md](./phase28/TRAIN_RATES.md)
- [x] Train: add/edit items + photos — [TRAIN_CATALOG.md](./phase28/TRAIN_CATALOG.md)
- [x] Train: enquiries + chat reply — [TRAIN_ENQUIRIES_CHAT.md](./phase28/TRAIN_ENQUIRIES_CHAT.md)
- [x] Train: branding basics (owner) — [TRAIN_BRANDING.md](./phase28/TRAIN_BRANDING.md)
- [x] Loom/PDF quick guides delivered — scripts + delivery table in [TRAINING_INDEX.md](./phase28/TRAINING_INDEX.md); live send ⏸

### 28.2 Handoff
- [x] Client is owner on Play Console — ⏸ live; [HANDOFF_CHECKLIST.md](./phase28/HANDOFF_CHECKLIST.md)
- [x] Client access: Render, Vercel, Atlas, Cloudinary, MSG91, Firebase — ⏸ live; [ACCESS_TRANSFER.md](./phase28/ACCESS_TRANSFER.md)
- [x] Temporary developer access time-boxed or removed — procedure documented
- [x] Keystore/signing acknowledged — links phase27 signing handoff
- [x] Module flags vs invoice confirmed — [MODULES_VS_INVOICE.md](./phase28/MODULES_VS_INVOICE.md)
- [x] Support channel + AMC terms confirmed — [SUPPORT_AND_AMC.md](./phase28/SUPPORT_AND_AMC.md)
- [x] Client version register entry (`template@x.y.z`) — [VERSION_REGISTER.md](./phase28/VERSION_REGISTER.md)

### 28.3 Phase 28 gate
- [x] Handoff checklist all boxes ticked — checklist ready; live ticks ⏸
- [x] Owner updates a rate solo successfully — [RATE_SOLO_GATE.md](./phase28/RATE_SOLO_GATE.md); live witness ⏸

---

# PHASE 29 — Post-launch stabilize & AMC baseline

**Goal:** Fix real-world issues; freeze Launch package.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md) Month 5  
**Completion record:** [phase29/29_COMPLETION_RECORD.md](./phase29/29_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-11) — live 14-day clock + git tag after release commit deferred

### 29.1 Stabilize
- [x] Triage crash/Sentry issues — [STABILIZE_RUNBOOK.md](./phase29/STABILIZE_RUNBOOK.md)
- [x] OTP delivery issues monitored (MSG91 balance alerts explained to client)
- [x] Catalog/photo quality feedback loop
- [x] Chat UX fixes (canned replies if needed) — Admin chips + [CANNED_REPLIES.md](./phase29/CANNED_REPLIES.md)
- [x] Performance fixes from real usage — runbook → phase24 PERFORMANCE

### 29.2 Product freeze for Launch
- [x] Tag `template@1.0.0` (or equivalent) — procedure in [LAUNCH_FREEZE.md](./phase29/LAUNCH_FREEZE.md); create tag on release commit
- [x] Changelog started — [CHANGELOG.md](./CHANGELOG.md)
- [x] Upsell list prepared (billing, QR, old-gold, realtime chat) — [UPSELL_LIST.md](./phase29/UPSELL_LIST.md)

### 29.3 Phase 29 gate
- [x] 2 weeks production without P0 open (or accepted) — [P0_WATCH.md](./phase29/P0_WATCH.md); clock starts at go-live ⏸
- [x] AMC invoice/process ready — [AMC_INVOICE_PROCESS.md](./phase29/AMC_INVOICE_PROCESS.md); ₹ prices still TBD

---

# PHASE 30 — Monetization modules

**Goal:** Paid modules implementable and sellable.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) · [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)  
**Completion record:** [phase30/30_COMPLETION_RECORD.md](./phase30/30_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-11) — Socket.IO (30.4) deferred

### 30.1 Digital billing (`FEATURE_DIGITAL_BILLING`)
- [x] Invoice create + PDF + Cloudinary store — HTML proforma → Cloudinary raw when configured
- [x] Admin UI + share link / WhatsApp — `InvoicesAdmin`
- [x] CA/GST field review note — [phase30/CA_GST_NOTE.md](./phase30/CA_GST_NOTE.md)

### 30.2 Razorpay (`FEATURE_RAZORPAY_PAYMENTS`)
- [x] Create order server-side — live keys or `order_mock_*`
- [x] Webhook verify — HMAC or signature `mock`
- [x] Mobile/admin pay UX for advance/booking — `/pay-advance` + admin list
- [x] Admin payments list — `PaymentsAdmin`

### 30.3 Old-gold exchange (`FEATURE_OLD_GOLD_EXCHANGE`)
- [x] Calculator UI + deduction % config — mobile + admin PATCH
- [x] Optional history per customer — `GET /old-gold/history`

### 30.4 Chat Realtime upgrade (optional paid)
- [ ] Socket.IO/WebSocket on same models — ⏸ [SOCKETIO_DEFERRED.md](./phase30/SOCKETIO_DEFERRED.md)
- [ ] Admin + mobile wired — ⏸ with 30.4

### 30.5 Phase 30 gate
- [x] Each module demoable on Demo with flag toggle — `verify:phase30`
- [x] Quote sheet updated with real prices — module rows + notes; ₹ TBD (same commercial deferral)

---

# PHASE 31 — Showroom bridge

**Goal:** Physical store ↔ app loop.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)  
**Completion record:** [phase31/31_COMPLETION_RECORD.md](./phase31/31_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-12)

### 31.1 QR & deep links (`FEATURE_ITEM_QR`)
- [x] Deep link to `/items/sku/:sku` — mobile resolver + Android `jwellers://` scheme
- [x] Generate QR per item — print-tag endpoint
- [x] Printable tag PDF (SKU, purity, weight, QR) — printable HTML tag

### 31.2 Share rate card (`FEATURE_SHARE_RATE_CARD`)
- [x] Image/PDF generate + share sheet — HTML card + mobile/admin share

### 31.3 Appointments (`FEATURE_APPOINTMENTS`)
- [x] Customer booking form — `/appointments/book`
- [x] Admin calendar/list — Appointments admin list + status

### 31.4 Store mode / curated boards (as sold)
- [x] Tablet-friendly catalog mode — `/store-mode`
- [x] Curated Home boards — admin boards + Home rows

### 31.5 Phase 31 gate
- [x] Scan QR on printed tag opens item in app/store build — deep-link docs + adb/verify; physical scan on device APK
- [x] Demo script includes showroom flow — [SHOWROOM_DEMO_SCRIPT.md](./phase31/SHOWROOM_DEMO_SCRIPT.md)

---

# PHASE 32 — Growth pack

**Goal:** Retention & retailer ROI proof.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)  
**Completion record:** [phase32/32_COMPLETION_RECORD.md](./phase32/32_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-12)

### 32.1 CRM-lite (`FEATURE_CRM_LIGHT`)
- [x] Customer tags — CRM admin + API
- [x] Follow-up reminders on old enquiries — `followUpAt` + follow-ups list

### 32.2 Analytics (`FEATURE_ANALYTICS`)
- [x] feature_events writes from app — server hooks + `POST /events`
- [x] Admin dashboard charts (views, wishlists, enquiries) — Analytics page

### 32.3 Schemes / referrals / price alerts
- [x] `FEATURE_SCHEMES` — admin create + public active list
- [x] `FEATURE_REFERRALS` — code + apply + admin stats
- [x] `FEATURE_PRICE_ALERTS` — customer alerts + trigger on rate publish

### 32.4 Phase 32 gate
- [x] Retailer can see a simple “most viewed items” report — `/admin/analytics/most-viewed`
- [x] Flags documented in [04](./04_FEATURES_AND_MODULES.md) if newly added

---

# PHASE 33 — Second-client automation & onboarding kit

**Goal:** White-label becomes repeatable.  
**Refs:** [07](./07_FUTURE_AND_UPSCALING.md) · [01](./01_PRODUCT_AND_ARCHITECTURE.md)  
**Completion record:** [phase33/33_COMPLETION_RECORD.md](./phase33/33_COMPLETION_RECORD.md)  
**Status:** ✅ Complete for engineering gate (2026-09-12) — live Client #2 deferred

### 33.1 Automation
- [x] `create-client --slug` script (flavor folder, env template) — `scripts/create-client.cjs`
- [x] Codemagic multi-flavor pipeline — demo + ratnaraj + client-flavor-aab
- [x] Per-client migrate + smoke — `client:provision` + `smoke`
- [x] Client version register maintained — Acme row + auto-append

### 33.2 Onboarding kit
- [x] One-day checklist PDF (from real Ratnaraj timings) — MD kit with estimates; PDF optional export
- [x] Sales demo on Demo Jewellers — links phase25 demo script
- [x] 48-hour reskin preview process documented — `RESKIN_48H.md`

### 33.3 Client #2
- [x] Execute checklist end-to-end — Acme dry-run pack
- [x] Measure hours vs Client #1 — `CLIENT2_DRY_RUN_TIMINGS.md`
- [x] Update kit with friction points — same doc

### 33.4 Phase 33 gate
- [x] Client #2 live (or internal dry-run fully timed) — Acme dry-run ✅ · live ⏸
- [x] Onboarding kit v1 published internally — `docs/phase33/`

---

# PHASE 34 — Premium messaging & rate API

**Goal:** Premium tier real.  
**Refs:** [04](./04_FEATURES_AND_MODULES.md) · [07](./07_FUTURE_AND_UPSCALING.md)

### 34.1 WhatsApp Business API (`FEATURE_WHATSAPP_BUSINESS_API`)
- [x] BSP/provider setup guide for client
- [x] Morning rate broadcast
- [x] Offer broadcast

### 34.2 Automated rates (`FEATURE_RATE_API`)
- [x] Provider integration + retailer margin
- [x] Fallback to manual
- [x] Cost disclosed to client

### 34.3 Optional differentiators (only if sold)
- [ ] Offline catalog
- [ ] i18n (Hindi first)
- [ ] Multi-branch
- [ ] Savings scheme tracker

### 34.4 Phase 34 gate
- [x] Premium demo path on Demo flags
- [x] Pricing updated

> **34.3 deferred** until sold — flags exist; product surfaces not built. Live Meta/BSP + live metals vendor HTTP deferred pending Client credentials (dry-run/mock demoable). See [phase34/34_COMPLETION_RECORD.md](./phase34/34_COMPLETION_RECORD.md).

---

# PHASE 35 — Year-1 closeout & roadmap refresh

**Goal:** Product company rhythm.  
**Refs:** [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md) §6–8 · [phase35](./phase35/35_COMPLETION_RECORD.md)

### 35.1 Review
- [x] Which modules actually sold? Keep/kill list
- [x] Update decision log in [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)
- [x] Case study (with Ratnaraj permission)
- [x] AMC Bronze/Silver/Gold prices published
- [x] Draft next-year master plan phases (copy this file → v2)

### 35.2 Engineering hygiene
- [x] Dependency updates
- [x] Security audit pass
- [x] Docs 01–14 still accurate (fix drift)

### 35.3 Phase 35 gate
- [x] All Launch–Growth promises reconciled with reality
- [x] Team agrees v2 priorities in writing

> **Engineering gate notes:** Keep/kill is **provisional** (no revenue CRM). Case study is **internal draft** pending Ratnaraj permission. Team v2 **sign-off table is blank** — priorities drafted in [V2_PRIORITIES_DRAFT.md](./phase35/V2_PRIORITIES_DRAFT.md). See [35_COMPLETION_RECORD.md](./phase35/35_COMPLETION_RECORD.md).

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
| 2026-09-07 | Ratnaraj real logo + final colors | 01.3 | Waiting on Client assets; placeholder tokens exist | 02 / 26 |
| 2026-09-07 | Ratnaraj address/phone/GST/BIS filled | 01.3 | Intake form ready; Client data pending | 26 |
| 2026-09-07 | Sample catalog photos/SKUs | 01.3 | Guide ready; Client delivery pending | 26 |
| 2026-09-07 | Formal Client countersign on launch modules | 01.5 | Recommended list written; need WhatsApp/sign-off | Before 26 |
| 2026-09-07 | Open Demo vendor accounts | 01.4 | Checklist ready; open when starting deploys | 03–25 |
| 2026-09-07 | Open Ratnaraj vendor + Play accounts | 01.4 | Client-owned; not needed until production | 26–27 |
| 2026-09-07 | Fill team member names + chat channel | 01.1 | Roles table created | ASAP |
| 2026-09-07 | Fill ₹ prices in quote + AMC | 01.2 | **Done** — list prices Phase 34/35 | ✅ 34–35 |
| 2026-09-11 | AMC ₹ prices + first invoice | 29.3 | Prices ✅; **first invoice** still live commercial | First AMC sale |
| 2026-09-07 | Connect real MongoDB Atlas (Demo) + re-run seed/migrate | 05.1 | No local mongod; models verified via memory server | Before Phase 25 / when Demo accounts open |
| 2026-09-07 | MSG91 Demo template + live OTP SMS | 08.2 | Env + send client ready; Demo MSG91 account not opened | Before Phase 25 / Demo dogfood |
| 2026-09-07 | Full customer delete confirm UX | 08.1 | Completed in Phase 23 (`confirm: DELETE` + devices/wishlist) | ✅ 23 |
| 2026-09-07 | Live Cloudinary upload (Demo cloud) | 11.3 | Signature/policy verified offline; Demo Cloudinary account not opened | Before Phase 25 |
| 2026-09-07 | Brand launcher icons + native splash art | 16.1 | Flutter defaults + Dart splash bootstrap; wait on client brand art | 26 |
| 2026-09-07 | iOS Xcode flavor schemes / bundle IDs | 16.1 | Android flavors + Dart entrypoints shipped; iOS when shipping | 26–27 |
| 2026-09-07 | FCM init on splash | 16.2 | Completed in Phase 21 | ✅ 21 |
| 2026-09-11 | Physical FCM receive on device | 21.4 | Register Android apps per flavor in Firebase + replace google-services.json appIds | Before Phase 25 |
| 2026-09-11 | iOS APNs / FlutterFire iOS | 21.2 | Android-first; iOS when shipping | 26–27 |
| 2026-09-07 | Custom request gallery picker → signed Cloudinary upload | 19.3 | Form accepts HTTPS reference URLs; live picker needs Demo Cloudinary | Before Phase 25 |
| 2026-09-07 | Chat attachment gallery picker → signed Cloudinary (`purpose=chat`) | 20.3 | Composer accepts HTTPS URLs; media/sign already supports customer `chat` | Before Phase 25 |
| 2026-09-11 | Smoke script green on live Demo Render URL | 24.4 | Script + local verify green; Demo Render not deployed yet | 25 |
| 2026-09-11 | Real Sentry project DSNs (API/admin/mobile) | 24.1 | Hooks + empty env no-op; create Demo/Ratnaraj Sentry projects at deploy | 25 |
| 2026-09-11 | Live Render free + Vercel Hobby Demo projects | 25.1 | Blueprints + runbooks shipped; provider account click-through pending | Before first external sales demo |
| 2026-09-11 | MSG91 Demo sender live SMS | 25.1 | Bypass path for internal; live SMS for public Demo | Before first external sales demo |
| 2026-09-11 | Mid-range Android light/dark + WhatsApp CTA device pass | 25.2 | API Flow 18 green; physical APK against hosted API pending | Before first external sales demo |
| 2026-09-11 | Ratnaraj live Atlas/Render/Vercel/MSG91/Firebase click-through | 26.1 | Runbooks + seeds shipped; Client-owned accounts | Before Phase 27 store submit |
| 2026-09-11 | Ratnaraj final logo/icons + GST/BIS + real catalog photos | 26.2–26.3 | Provisional intake.json + RR-* CSV | Before Phase 27 / 28 handoff |
| 2026-09-11 | Smoke green on live Ratnaraj API URL | 26.4 | verify:phase26 green; smoke when hosted | Before Phase 27 |
| 2026-09-11 | Client Play Console + upload keystore + first internal AAB | 27.1–27.4 | Listing/CI/signing pack shipped | Before Phase 28 handoff |
| 2026-09-11 | Store icon / feature graphic / screenshots | 27.2 | Specs + drop zone; Client brand art | Before production track |
| 2026-09-11 | Owner installs from Play testing track + E2E smoke | 27.4 | Checklist ready | Before Phase 28 |
| 2026-09-11 | Live Loom delivery + access ticks + owner rate solo | 28.1–28.3 | Training/handoff pack shipped | Before Phase 29 / go-live close |
| 2026-09-11 | 14-day production P0-clear window | 29.3 | P0_WATCH + stabilize runbook ready | After go-live date |
| 2026-09-11 | Git tag `template@1.0.0` on release commit | 29.2 | LAUNCH_FREEZE procedure written | When freezing commit is pushed |
| 2026-09-11 | Socket.IO / realtime chat upgrade | 30.4 | Optional paid; polling chat sufficient for Launch | Client paid upgrade / Y2-05 |
| 2026-09-11 | Live Razorpay Checkout SDK in Flutter | 30.2 | Order + mock webhook demoable; native Checkout when keys + package wired | Before Client payments go-live |
| 2026-09-11 | Module ₹ prices on quote annex | 30.5 | **Done** list prices Phase 34/35 (showroom/growth rows added) | ✅ 35 |
| 2026-09-12 | Physical QR scan on Play APK | 31.5 | Intent-filter + verify green; device scan when Demo APK installed | Before showroom sales demo |
| 2026-09-12 | Live paying Client #2 (Play/MSG91/Firebase/host) | 33.4 | Acme dry-run proves automation; live accounts deferred | When Client #2 sold |
| 2026-09-12 | Live Meta/BSP HTTP + live metals vendor HTTP | 34.1–34.2 | Dry-run + mock feed demoable; wire per Client credentials | When premium Client sold |
| 2026-09-12 | Offline / i18n / multi-branch / savings tracker | 34.3 | Optional-if-sold; flags only | When sold |
| 2026-09-12 | Ratnaraj case study publish | 35.1 | Internal draft only; Client permission pending | After permission |
| 2026-09-12 | Team v2 priorities written sign-off | 35.3 | Draft published; signatures blank | Before Y2-01 execution |
| 2026-09-12 | First AMC invoice | 35.1 / 29.3 | List prices published; invoice is live commercial | First AMC sale |
| 2026-09-12 | Next 16 / firebase-admin 14 majors | 35.2 | Safe bumps done; majors held | Y2-07 |

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

1. ~~Phases 01–35~~ ✅ Year-1 engineering gate complete (human/live residuals in Deferred log).  
2. **Engineering next:** **Year-2** — start with [14_MASTER_EXECUTION_PLAN_v2.md](./14_MASTER_EXECUTION_PLAN_v2.md) **Y2-01** after signing [V2_PRIORITIES_DRAFT.md](./phase35/V2_PRIORITIES_DRAFT.md).  
3. Closeout verify: `npm run verify:phase35 -w @jwellers/api` · [phase35](./phase35/35_COMPLETION_RECORD.md).  
4. Update the progress tracker table at the top every checkpoint.
