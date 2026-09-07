# Jewellery White-Label App — Documentation Index

**Status:** Locked and ready to build  
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
| 14 | [14_MASTER_EXECUTION_PLAN.md](./14_MASTER_EXECUTION_PLAN.md) | **FINAL EXECUTION CHECKLIST** — 35 phases with sub-phases; use this to run the whole project |

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
