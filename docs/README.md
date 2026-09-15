# Jewellery White-Label App — Documentation Index

**Status:** Year-1 engineering complete (Phases 01–35 gate) · Year-2 draft in [14 v2](./14_MASTER_EXECUTION_PLAN_v2.md)  
**First client:** Ratnaraj Jewellers  
**Stack (final):** Flutter · Node/Express (TypeScript) · MongoDB Atlas · Next.js · Render · Vercel Hobby · Cloudinary · MSG91 · FCM  

---

## How to use these docs

Read in order for onboarding. Each file has **one job**. Do not mix older files into planning — they are superseded.

| # | Document | What it answers |
|---|---|---|
| 1 | [01_PRODUCT_AND_ARCHITECTURE.md](./01_PRODUCT_AND_ARCHITECTURE.md) | What we build, dedicated-infra model, tech stack, theming, environments, deploy checklist, costs |
| 2 | [02_AUTH_AND_SECURITY.md](./02_AUTH_AND_SECURITY.md) | Customer OTP, admin auth, JWT, roles, rate limits, secrets, uploads, breach isolation |
| 3 | [03_DATA_MODEL.md](./03_DATA_MODEL.md) | Production MongoDB / Mongoose schemas, indexes, statuses, soft-delete |
| 4 | [04_FEATURES_AND_MODULES.md](./04_FEATURES_AND_MODULES.md) | Every feature, MVP vs paid modules, `.env` flags, client costing, **chat system** |
| 5 | [05_BUILD_ROADMAP.md](./05_BUILD_ROADMAP.md) | Phased build order, durations, immediate next steps |
| 6 | [06_LEGAL_AND_COMPLIANCE.md](./06_LEGAL_AND_COMPLIANCE.md) | Privacy, Play Store, account deletion, GST billing, keystore handoff |
| 7 | [07_FUTURE_AND_UPSCALING.md](./07_FUTURE_AND_UPSCALING.md) | Post-MVP upgrades, ops automation while keeping per-client isolation |
| 8 | [08_ENHANCEMENTS_AND_MONTHLY_PLAN.md](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md) | Missing gaps, polish, new sellable ideas, **month-by-month plan**, sales packages, idea decision log |
| 9 | [09_BACKEND_API.md](./09_BACKEND_API.md) | Express folder layout, middleware, **full route catalog**, errors, pagination |
| 10 | [10_ADMIN_WEB_PAGES.md](./10_ADMIN_WEB_PAGES.md) | Next.js admin **routes, page UI specs**, nav, permissions |
| 11 | [11_MOBILE_APP_SCREENS.md](./11_MOBILE_APP_SCREENS.md) | Flutter **screens, navigation, Riverpod**, flavor bootstrap |
| 12 | [12_DESIGN_SYSTEM.md](./12_DESIGN_SYSTEM.md) | Tokens, layout rules, wireframe checklist, do/don’t |
| 13 | [13_END_TO_END_FLOWS.md](./13_END_TO_END_FLOWS.md) | Auth, rates, catalog, wishlist, enquire, **chat**, delete — step-by-step across mobile/admin/API |
| 14 | [14_MASTER_EXECUTION_PLAN.md](./14_MASTER_EXECUTION_PLAN.md) | **Year-1 FINAL EXECUTION CHECKLIST** — 35 phases |
| 14v2 | [14_MASTER_EXECUTION_PLAN_v2.md](./14_MASTER_EXECUTION_PLAN_v2.md) | **Year-2 draft** phases (awaiting team sign-off) |
| 15 | [15_EXTERNAL_GAPS_AND_SETUP_GUIDE.md](./15_EXTERNAL_GAPS_AND_SETUP_GUIDE.md) | **Mocks / deferred externals** — Atlas, MSG91, Cloudinary, FCM, client assets + how to get them |
| — | [READINESS_WEBSITE_AND_SYSTEM.md](./READINESS_WEBSITE_AND_SYSTEM.md) | **Website & system readiness** — legal, UX states, SEO checklist (complete for engineering) |
| — | [READINESS_LEGAL_URLS_RUNBOOK.md](./READINESS_LEGAL_URLS_RUNBOOK.md) | Per-client Play URL wiring |
| — | [READINESS_CLIENT_LEGAL_REVIEW.md](./READINESS_CLIENT_LEGAL_REVIEW.md) | Counsel sign-off pack |
| — | [POST_PHASE35_AUDIT.md](./POST_PHASE35_AUDIT.md) | **Post–Phase 35 audit** — gaps, bugs, risks, P0–P2 fix list |

## Commercial & Phase packs

| Path | Purpose |
|---|---|
| [commercial/](./commercial/) | MSA draft, quote, running costs, AMC tiers |
| [phase01/](./phase01/) | Kickoff alignment, accounts checklist, launch modules, completion record |
| [design/](./design/) | **Phase 02** — design system, mobile/admin wireframes, flow review |
| [phase03/](./phase03/) | **Phase 03** — monorepo completion + Flutter CI note |
| [phase04/](./phase04/) | **Phase 04** — API foundation completion record |
| [phase05/](./phase05/) | **Phase 05** — DB models completion record |
| [phase06/](./phase06/) | **Phase 06** — public config / features completion |
| [phase07/](./phase07/) | **Phase 07** — admin authentication completion |
| [phase08/](./phase08/) | **Phase 08** — customer OTP authentication completion |
| [phase09/](./phase09/) | **Phase 09** — rates API + calculator quote completion |
| [phase10/](./phase10/) | **Phase 10** — catalog categories/items + dashboard stub |
| [phase11/](./phase11/) | **Phase 11** — Cloudinary media signing + upload policy |
| [phase12/](./phase12/) | **Phase 12** — wishlist, enquiries, custom requests, offers |
| [phase13/](./phase13/) | **Phase 13** — admin web shell, auth, dashboard |
| [phase14/](./phase14/) | **Phase 14** — admin rates & catalog UI |
| [phase15/](./phase15/) | **Phase 15** — branding, enquiries, offers, staff, settings |
| [phase16/](./phase16/) | **Phase 16** — mobile flavors, theme, router, Dio/Riverpod |
| [phase17/](./phase17/) | **Phase 17** — mobile Home, Collection, Item detail |
| [phase18/](./phase18/) | **Phase 18** — calculator, rate history, size guide |
| [phase19/](./phase19/) | **Phase 19** — mobile auth, wishlist, enquire, WhatsApp |
| [phase20/](./phase20/) | **Phase 20** — chat Phase A (API + admin + mobile) |
| [phase21/](./phase21/) | **Phase 21** — FCM push (devices, rates/chat/arrival) |
| [phase22/](./phase22/) | **Phase 22** — Hallmark, Offers, clone, CSV import, filters |
| [phase23/](./phase23/) | **Phase 23** — Privacy/terms, account deletion, Play data safety |
| [phase24/](./phase24/)–[phase34/](./phase34/) | Hardening → Demo → Ratnaraj → Play → handoff → launch freeze → monetization → showroom → growth → Client #2 automation → premium messaging |
| [phase35/](./phase35/) | **Year-1 closeout** — keep/kill, reconciliation, audits, v2 priorities |
| [../clients/ratnaraj/](../clients/ratnaraj/) | First client intake + branding placeholders |
| [../clients/demo/](../clients/demo/) | Demo Jewellers template brand |
| [../clients/acme/](../clients/acme/) | Client #2 dry-run pack |

### Suggested reading for implementers

1. Product lock: **01 → 04**  
2. Data & security: **03 → 02**  
3. Build surfaces: **09 → 10 → 11 → 12**  
4. Wire it together: **13**  
5. Calendar / extras: **05 → 08**  
6. **Execute day-to-day: 14 (Master Plan)**  

---

## Locked decisions (do not reopen without a written change)

1. **Not multi-tenant SaaS.** Each client gets own app, own DB, own backend, own Play listing.
2. **Dedicated infra is intentional** — isolation, customization, and blast-radius control beat shared-tenant cost savings for this product.
3. **Stack:** Flutter + Express/TS + MongoDB + Next.js + Render + Vercel Hobby.
4. **Features are env-flagged** so clients are priced by what they turn on.
5. **Chat is in scope** (structured threads → real-time), not deferred forever.
6. **Client owns** Play Console, hosting accounts, SMS, and running costs.

---

## Superseded files (do not use for decisions)

| Old file | Reason |
|---|---|
| `Jewellery_WhiteLabel_App_Plan.md` | Early draft (React Native / FastAPI / Railway) — outdated |
| `Jewellery_TECHSTACKS.md` | Mid draft (Railway; incomplete security/schema) — outdated |
| `more_features.md` | Merged into docs 01–07 — outdated |

If anything in a superseded file conflicts with docs 01–14, **01–14 win**. For day-to-day build order and checkboxes, **[14_MASTER_EXECUTION_PLAN](./14_MASTER_EXECUTION_PLAN.md) is authoritative**.
