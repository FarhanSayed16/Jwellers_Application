# 05 — Build Roadmap

**Source of truth for:** high-level build phases and immediate next steps.  
**For the complete checkbox execution plan (35 phases + sub-phases), use [14_MASTER_EXECUTION_PLAN](./14_MASTER_EXECUTION_PLAN.md).**  
**Related:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) · [02](./02_AUTH_AND_SECURITY.md) · [03](./03_DATA_MODEL.md) · [04](./04_FEATURES_AND_MODULES.md)

---

## 1. Assumptions

- Two developers, part-time → durations are **order-of-magnitude**, not contracts.  
- Stack locked: Flutter · Express/TS · Mongo · Next · Render · Vercel Hobby.  
- Dedicated infra per client; feature modules via `.env`.  
- Chat Phase A (REST + FCM) ships with the first production-quality app.

---

## 2. Phase plan

| Phase | Focus | Rough duration |
|---|---|---|
| **0** | Wireframe every Core + Chat screen; lock schemas in [03](./03_DATA_MODEL.md); confirm Ratnaraj module flags | 1 week |
| **1** | Monorepo skeleton; Flutter flavors; design tokens; `GET /config/public` + `/config/features`; `.env.example` | 1–1.5 weeks |
| **2** | Auth ([02](./02_AUTH_AND_SECURITY.md)): admin password, customer OTP, JWT refresh, rate limits; Mongoose models + indexes | 1–2 weeks |
| **3** | API: categories/items CRUD, rates (+ history), wishlist, enquiries, signed Cloudinary | 1–2 weeks |
| **4** | Admin panel: rates, catalog, branding, enquiry inbox, module-aware nav | 2 weeks |
| **5** | Chat Phase A: APIs + admin inbox + Flutter Chat tab | 1–1.5 weeks |
| **6** | Flutter Core UI: Home, Collection, Item detail, Calculator, Rate history, Size guide, theme | 2–3 weeks |
| **7** | Flutter: OTP, Wishlist, Enquire, WhatsApp CTAs (if on), FCM | 1–2 weeks |
| **8** | Toggle modules as needed: Hallmark UI, etc., behind flags | 0.5–1 week |
| **9** | Demo Jewellers staging dogfood + fixes | 1 week |
| **10** | Ratnaraj onboarding (checklist in [01](./01_PRODUCT_AND_ARCHITECTURE.md) §7) + Play submit | ongoing |
| **11** | Document real spin-up time → seed [07](./07_FUTURE_AND_UPSCALING.md) onboarding kit | 2–3 days |

Phases 5–7 can overlap across two developers (one API/admin-leaning, one Flutter-leaning) once Phase 2 contracts are stable.

---

## 3. Definition of done (first production client)

- [ ] Dedicated Atlas + Render Starter + Vercel + Cloudinary under client (or documented handoff)  
- [ ] Flavor build on client Play Console (internal/closed test at minimum)  
- [ ] Owner can set rates and manage catalog without developer help  
- [ ] Customer can browse, calculate, OTP login, wishlist, enquire  
- [ ] Chat works end-to-end if `FEATURE_CHAT=true`  
- [ ] Feature flags match signed quote  
- [ ] Privacy policy + delete-account path live ([06](./06_LEGAL_AND_COMPLIANCE.md))  
- [ ] Keystore / secrets ownership documented  

---

## 4. Immediate next steps (post Year-1)

Year-1 engineering phases **01–35** are complete for the gate (see [14](./14_MASTER_EXECUTION_PLAN.md)). Do **not** restart monorepo/wireframe work.

1. Execute **Year-2** from [14_MASTER_EXECUTION_PLAN_v2.md](./14_MASTER_EXECUTION_PLAN_v2.md) after team sign-off.  
2. Close Ratnaraj live DoD residuals (Play, hosted smoke, training).  
3. Host Demo for external sales demos.  
4. Keep docs 03/09/10 in sync when adding modules.

---

## 5. What not to do yet

- Multi-tenant rewrite discussions  
- iOS until a client pays Apple + extra QA  
- Offline / multi-branch / savings **tracker** / AR / AI until sold  
- Express 5 / Next 16 / firebase-admin 14 without a dedicated upgrade phase  
- Building Socket.IO chat without a paid upgrade line  

> Historical note: Year-1 “don’t build rate API / analytics before Core” applied during Months 1–4. Those modules now exist behind flags (Phases 32–34).
