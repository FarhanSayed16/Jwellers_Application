# Post–Phase 35 Audit — Gaps, Bugs, Risks & Required Fixes

**Date:** 2026-09-12  
**Scope:** Year-1 Phases 01–35 (engineering gate) + Website/System Readiness  
**Sources:** Master plan Deferred log · phase completion records · code spot-check (API / admin / mobile) · readiness docs  
**Related:** [14_MASTER_EXECUTION_PLAN.md](./14_MASTER_EXECUTION_PLAN.md) · [READINESS_WEBSITE_AND_SYSTEM.md](./READINESS_WEBSITE_AND_SYSTEM.md) · [phase35/SECURITY_AUDIT_2026.md](./phase35/SECURITY_AUDIT_2026.md) · [15_EXTERNAL_GAPS_AND_SETUP_GUIDE.md](./15_EXTERNAL_GAPS_AND_SETUP_GUIDE.md)

---

## Executive verdict

| Layer | Status |
|---|---|
| **Year-1 engineering (code + verify scripts)** | ✅ Gate complete for Phases 01–35 |
| **Website & system readiness (engineering)** | ✅ Checklist complete |
| **Ratnaraj production / Play ship** | ❌ Blocked — client assets, live vendors, legal signatures, store binaries |
| **Demo hosted sales stack** | ❌ Not live — blocks credible external demos |
| **Sold-module honesty** | ⚠️ Several Premium flags are mock/dry-run or UI-incomplete |

**Bottom line:** Development through Phase 35 is **engineering-complete**. The product is **not production-shippable** until P0 ops/client/legal items below are cleared. A small set of **code security gaps** should be fixed before any production flag for payments or multi-client push is enabled.

---

## How to use this file

1. Work **P0 → P1 → P2**.  
2. Tick items when fixed or explicitly accepted with owner + date.  
3. Do not treat “phase ✅” as “live DoD done” — most residual risk is human/live, not missing phase folders.

**Priority legend**

| Priority | Meaning |
|---|---|
| **P0** | Block production / Play / enablement of a dangerous flag |
| **P1** | Required before first external sales demo or honest module sale |
| **P2** | Quality, debt, Year-2 — improve when capacity allows |

---

## 1. Critical code fixes (P0)

| ID | Issue | Evidence | Required fix | Status |
|---|---|---|---|---|
| **C-01** | **Razorpay mock webhook forgeable when keys missing** | `payments.service.ts` mock orders + `mock`/`test` signatures | Refuse mock outside `development`/`test`; require Razorpay keys in production when flag ON | ✅ Fixed 2026-09-12 |
| **C-02** | **Shared hardcoded Firebase client config across flavors** | `push_service.dart` Kavach hardcode | Per-flavor `google-services.json` / `FIREBASE_*` dart-defines; no shared project in source | ✅ Fixed 2026-09-12 |
| **C-03** | **Cleartext HTTP allowed on Android release** | main `AndroidManifest` `usesCleartextTraffic` | Cleartext only in `src/debug` | ✅ Fixed 2026-09-12 |

---

## 2. Live ops / client blockers (P0 — cannot ship Ratnaraj)

| ID | Gap | Doc / path | Required action |
|---|---|---|---|
| **O-01** | Vendor stack not opened (Atlas, Render, Vercel, Cloudinary, MSG91, Firebase, Play) | `phase01/01_ACCOUNTS_CHECKLIST.md` · `phase26/PROVISION_RATNARAJ.md` | Client-owned accounts + env populated |
| **O-02** | No live Ratnaraj API/admin smoke | `phase26/26_COMPLETION_RECORD.md` | Host + `verify:phase26` / smoke against production URL |
| **O-03** | Branding incomplete (logo, icons, splash, final colors) | `clients/ratnaraj/branding/` · flavor placeholders | Deliver art; re-seed shop config |
| **O-04** | Intake still provisional | `clients/ratnaraj/intake.json` (`provisional: true`, placeholder phone/address) | Real contact, GST/BIS as applicable |
| **O-05** | Catalog photos provisional | `clients/ratnaraj/catalog/` | Real SKUs + photos |
| **O-06** | Launch modules not countersigned | `clients/ratnaraj/modules.json` | Client sign-off; align `FEATURE_*` + invoice |
| **O-07** | Play signing + first AAB | `phase27/SIGNING_HANDOFF.md` · `CI_STUB.md` | Client keystore; Codemagic/CI green AAB |
| **O-08** | Store listing binaries missing | `phase27/STORE_ASSETS.md` · `clients/ratnaraj/store/` | Icon 512, feature graphic, screenshots |
| **O-09** | Owner install + E2E from Play track | `phase27/INTERNAL_TESTING_CHECKLIST.md` | Internal testing track + smoke |
| **O-10** | Production `LEGAL_*` URLs | `READINESS_LEGAL_URLS_RUNBOOK.md` | Paste live admin host URLs |
| **O-11** | Counsel legal sign-off blank | `READINESS_CLIENT_LEGAL_REVIEW.md` | Privacy/Terms/Cookies counsel OK |
| **O-12** | Security cutover incomplete | `phase24/SECURITY_REVIEW.md` · `phase35/SECURITY_AUDIT_2026.md` | Rotate shared credentials; Atlas IP allow-list; enable Sentry DSNs; Atlas backup + restore drill |
| **O-13** | Handoff + owner rate-solo unticked | `phase28/HANDOFF_CHECKLIST.md` · `RATE_SOLO_GATE.md` · `ACCESS_TRANSFER.md` | Live training/access session |
| **O-14** | MSA/DPA/quote unsigned | `commercial/MSA_DRAFT.md` (liability § still placeholder) · `DPA_ANNEX.md` · `QUOTE_TEMPLATE.md` | Lawyer review + Client signatures |

---

## 3. Important product / honesty gaps (P1)

These are **not missing phase folders** — they are incomplete or oversold surfaces relative to flags and sales language.

| ID | Gap | Evidence | Required improvement | Status |
|---|---|---|---|---|
| **P-01** | **Schemes flag unused on mobile** | API + `SchemesAdmin` exist; mobile calculator/home never loads `/schemes/active` | Wire active schemes into calculator/home **or** document as admin-only until sold with mobile UI | ✅ Fixed 2026-09-12 — home chip + calculator making override |
| **P-02** | **Price alerts: no push on trigger** | `evaluatePriceAlerts` marks DB only — no FCM | Send push (and optional admin notify) when rate crosses threshold | ✅ Fixed 2026-09-12 |
| **P-03** | **Razorpay: no Checkout SDK** | Mobile creates order / shows mock note only | Integrate Razorpay Flutter Checkout **or** sell as “order + admin reconcile” only | ✅ Fixed 2026-09-12 — `razorpay_flutter` + Checkout when keys live |
| **P-04** | **WhatsApp Business live send always fails outside dry-run** | `whatsappBusiness.service.ts` `dispatchTemplate` | Wire real BSP when credentials exist; keep dry-run default | ✅ Fixed 2026-09-12 |
| **P-05** | **Rate API always mock spot** | `rateApi.service.ts` `fetchSpotFromProvider` | Live metals HTTP when premium sold + credentials | ✅ Fixed 2026-09-12 — metals-api / goldapi when key + `RATE_API_DRY_RUN=false` |
| **P-06** | **34.3 flags exist with no product** | `offlineCatalog` / `i18n` / `multiBranch` in `features.ts` only | Hide from public `/config/features` until implemented, **or** build when sold | ✅ Fixed 2026-09-12 |
| **P-07** | **Settings panel omits newer flags** | `SettingsPanel.FLAG_LABELS` missing rateApi, WA Business, multiBranch, offline, i18n | Add labels so owners see what is ON | ✅ Fixed 2026-09-12 |
| **P-08** | **Referrals: no reward/credit** | Apply + stats only | Define reward model or mark “tracking-only” in quote sheet | ✅ Fixed 2026-09-12 — `mode: tracking_only` + quote notes |
| **P-09** | **Payments admin is list-only** | No mark-paid / reconcile UI | Add reconcile actions if webhook-only is insufficient for jewellers | ✅ Fixed 2026-09-12 — mark-paid API + admin button |
| **O-gold** | **Old-gold: no admin quote queue** | Admin edits deduction % only | Inbox for customer estimates if selling full module | ✅ Fixed 2026-09-12 — `GET /admin/old-gold/quotes` + UI |
| **P-10** | **Digital billing: no customer invoice UI** | Flag on mobile `FeatureFlags`; no screen | Customer PDF/view **or** admin-only positioning | ✅ Fixed 2026-09-12 — `/me/invoices` + mobile screen |
| **P-11** | **WA broadcast has no opt-in filter** | `countOptInRecipients` counts all customers | Persist WA marketing opt-in; filter recipients | ✅ Fixed 2026-09-12 |
| **P-12** | **Admin JWT in `localStorage`** | `apps/admin/src/lib/api.ts` | Prefer httpOnly cookies before broader staff use | ✅ Fixed 2026-09-12 — httpOnly session cookies + memory hydrate |
| **P-13** | **`devOtp` may appear in navigation query** | Mobile phone → OTP route | Never put OTP in URL; ensure prod never returns `devOtp` | ✅ Fixed 2026-09-12 — GoRouter `extra` only |
| **P-14** | **Demo stack not hosted** | Deferred 25.x | Live Demo Render/Vercel/Atlas/MSG91/Cloudinary/Firebase for sales demos | 📋 Checklist `docs/ops/DEMO_HOSTING_CHECKLIST.md` (ops — not code-complete) |
| **P-15** | **Gallery → Cloudinary deferred** | Custom requests + chat attachments = HTTPS URL only | Signed upload picker before selling those as polished flows | ✅ Fixed 2026-09-12 — image_picker + signed upload helper |
| **P-16** | **Physical FCM / device QA deferred** | Phase 21/25 | Mid-range Android pass + real push receive per flavor | 📋 Checklist `docs/ops/DEVICE_FCM_QA_CHECKLIST.md` (ops — not code-complete) |
| **P-17** | **Sales language risk** | `phase35/PACKAGE_RECONCILIATION.md` | Quote sheet must say mock/dry-run for Razorpay Checkout, BSP, Rate API until live | ✅ Fixed 2026-09-12 — quote + reconciliation notes |

---

## 4. Documented deferred engineering (accepted — track explicitly)

From [14_MASTER_EXECUTION_PLAN.md](./14_MASTER_EXECUTION_PLAN.md) Deferred log (open):

| Item | Target |
|---|---|
| Socket.IO / realtime chat (polling OK today) | Paid upgrade / Y2 — `phase30/SOCKETIO_DEFERRED.md` |
| Live Razorpay Checkout SDK | Before payments go-live |
| Live Meta/BSP + live metals HTTP | When Premium sold |
| Offline catalog / i18n / multi-branch / savings scheme tracker | When sold (34.3) |
| iOS flavors / APNs | When iOS sold |
| Live paying Client #2 | When sold (Acme dry-run only) |
| `template@1.0.0` git tag + 14-day P0 clock | At freeze / go-live |
| Case study publish + team v2 sign-off + first AMC invoice | Human/commercial |
| Next 16 / firebase-admin 14 / Express 5 majors | Y2-07 |

---

## 5. Bugs / quality risks (P1–P2)

| ID | Pri | Issue | Notes |
|---|---|---|---|
| **Q-01** | P1 | Thin automated tests for Phases 30–35 | Rely on `verifyPhase*` scripts; no unit/integration tests under `apps/` for growth/monetization; Flutter gate tests stop ~Phase 21 |
| **Q-02** | P1 | Admin has no test script | Add smoke or Playwright for login + rates save |
| **Q-03** | P2 | Dead `PlaceholderScreen` still in mobile codebase | Unused by router — delete to avoid confusion |
| **Q-04** | P2 | Webhook body re-stringify vs raw body | Payments route comment: production should mount raw parser for HMAC |
| **Q-05** | P2 | firebase-admin transitive moderates accepted | Track in `phase35/DEPENDENCY_AUDIT.md` until major bump |
| **Q-06** | P2 | Nested Next/postcss advisories until Next 16 | Same |
| **Q-07** | P2 | Flutter `pub outdated` not run on CI | Add when Flutter available in CI |
| **Q-08** | P2 | Stale note risk: Phase 29 “AMC ₹ prices deferred” | Prices published in `AMC_TIERS.md` — only first invoice remains |
| **Q-09** | P2 | Seed scripts print passwords | Fine locally; never run against shared/prod without care (`seedOwner.ts`) |
| **Q-10** | P2 | Schemes admin create/list only | Edit/deactivate UX if schemes are sold heavily |

---

## 6. Enhancements (P2 — recommended)

| ID | Enhancement | Why |
|---|---|---|
| **E-01** | Socket.IO chat when volume grows | Polling 5–8s is OK for v1; latency/cost tradeoff |
| **E-02** | Proper `@sentry/nextjs` (not stub) | Source maps + admin errors |
| **E-03** | Dependabot/Renovate | Supply-chain hygiene |
| **E-04** | Onboarding kit PDF for Client #2 | Sales velocity (`phase33`) |
| **E-05** | Rewrite KEEP_KILL with Sold/Not sold after first invoices | Revenue-backed keep/kill |
| **E-06** | Customer-facing invoice / payment history | Completes billing story |
| **E-07** | Price-alert admin actions (mute, re-arm) | Ops beyond read-only list |
| **E-08** | CRM follow-up reminders via FCM/email | Growth pack depth |
| **E-09** | Analytics export CSV | Jeweller reporting |
| **E-10** | Accessibility audit (axe) on admin forms | Beyond skip-link pass |

---

## 7. Risks & assumptions that may be wrong

| Risk | Why it matters |
|---|---|
| “Engineering complete” ≈ “ready to ship” | Almost all Ratnaraj DoD is still human/live (O-01…O-14) |
| Module flags ON by default = Client-approved | Countersign still pending — wrong flags → wrong invoice |
| Provisional contact data OK for Play | Misleading trust / policy rejection risk |
| Empty Sentry OK until projects exist | First production incidents may be invisible |
| Polling chat sufficient forever | High enquiry shops may need Socket.IO sooner |
| “Premium built” = live Checkout/BSP/metals | Sales overclaim — see PACKAGE_RECONCILIATION |
| Festival schemes ≡ savings tracker | Different products; 34.3 still unbuilt |
| Acme dry-run = Client #2 calendar | Live Play/MSG91/Firebase dominate real timelines |
| 14-day warranty already running | `P0_WATCH.md` clock starts at **go-live**, not engineering freeze |
| MSA draft safe to sign as-is | Liability placeholder needs counsel rewrite |

---

## 8. What is solid (do not rework casually)

- Auth model: JWT audience split, OTP quotas, production secret assert (core secrets), Helmet + rate limits  
- Core catalog / rates / enquiries / wishlist / offers / chat (polling) — end-to-end  
- Showroom (31): QR, rate card, appointments, store mode, boards  
- Growth (32) server events + CRM/referrals/price-alert CRUD + FCM on price-alert trigger  
- Feature gating via `requireFeature` on paid API routes  
- Legal pages + cookie consent + maintenance/403/404/error for admin readiness  
- Phase verify scripts for 22 / 26 / 30–34 are meaningful API gates  

---

## 9. Suggested fix order (execution checklist)

### Sprint A — Security before any paid flag in production
- [x] **C-01** Harden Razorpay mock path  
- [x] **C-02** Per-flavor Firebase options  
- [x] **C-03** Disable cleartext in release  
- [x] **P-13** Strip OTP from URLs  
- [ ] **Q-04** Raw body for payment webhook HMAC  

### Sprint B — Ratnaraj go-live path
- [ ] **O-01…O-14** (accounts → assets → smoke → Play → legal → handoff → commercial)  
- [ ] Tag `template@1.0.0` when freezing (`LAUNCH_FREEZE.md`)  
- [ ] Start `P0_WATCH.md` clock at go-live  

### Sprint C — Module honesty + sales demo
- [ ] **P-14** Host Demo stack (`docs/ops/DEMO_HOSTING_CHECKLIST.md`)  
- [x] **P-01…P-11, P-17** Close product gaps or rewrite quote language  
- [x] **P-15** Upload picker  
- [ ] **P-16** Device FCM pass (`docs/ops/DEVICE_FCM_QA_CHECKLIST.md`)  

### Sprint D — Hardening & Year-2 prep
- [ ] **Q-01, Q-02** Broader tests  
- [ ] **E-02…E-05** Sentry, Dependabot, KEEP_KILL refresh  
- [ ] Sign `V2_PRIORITIES_DRAFT.md` before Y2-01  

---

## 10. Counts (snapshot)

| Category | Approx. open items |
|---|---|
| Critical code (P0) | 0 open (C-01…C-03 fixed) |
| Live ops / legal ship blockers (P0) | 14 |
| Product honesty / demo (P1) | ~2 open (P-14 host, P-16 device QA) |
| Quality / debt (P1–P2) | ~10 |
| Enhancements (P2) | ~10 |
| Explicit deferred (accepted) | See §4 |

---

*This audit does not invent a new build phase. It reconciles “phase ✅” with shippable reality. Update tickboxes here as fixes land; promote resolved P0s into completion notes in the relevant phase record or readiness doc.*
