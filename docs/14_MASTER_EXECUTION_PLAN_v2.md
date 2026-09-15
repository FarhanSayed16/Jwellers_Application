# 14 — MASTER EXECUTION PLAN v2 (Year-2 draft)

**Status:** DRAFT — awaiting written team sign-off ([phase35/V2_PRIORITIES_DRAFT.md](./phase35/V2_PRIORITIES_DRAFT.md))  
**Supersedes for Year-2 work:** this file (do not reopen Year-1 phases 01–35 except residual DoD)  
**Year-1 freeze reference:** [14_MASTER_EXECUTION_PLAN.md](./14_MASTER_EXECUTION_PLAN.md) (complete for engineering gate)  
**Stack:** unchanged — Flutter · Express/TS · MongoDB Atlas · Next.js · Render · Vercel · Cloudinary · MSG91 · FCM  

---

## Progress tracker

| Phase | Name | Status | Owner | Done date |
|---|---|---|---|---|
| Y2-01 | Ratnaraj live DoD closeout | ☐ | | |
| Y2-02 | Hosted Demo sales path | ☐ | | |
| Y2-03 | Live Client #2 (paying) | ☐ | | |
| Y2-04 | Premium vendor wiring (BSP / metals / Razorpay Checkout) | ☐ | | |
| Y2-05 | Paid Socket.IO chat (if sold) | ☐ | | |
| Y2-06 | Optional-if-sold differentiators | ☐ | | |
| Y2-07 | Dependency majors + Dependabot | ☐ | | |
| Y2-08 | Docs & commercial refresh | ☐ | | |

---

# Y2-01 — Ratnaraj live DoD closeout

**Goal:** First production client checklist in Year-1 [14] “Cross-phase DoD” actually true.

- [ ] Client Play Console + keystore ownership  
- [ ] Internal/closed testing AAB installed by owner  
- [ ] Live Atlas/Render/Vercel/MSG91/Firebase for Ratnaraj  
- [ ] Owner sets rates + catalog solo  
- [ ] Privacy + delete-account URLs live  
- [ ] Training Loom + access ticks  
- [ ] 14-day P0-clear window tracked  
- [ ] Git tag `template@1.0.0` on freeze commit (if not done)

---

# Y2-02 — Hosted Demo sales path

**Goal:** External sales demo without localhost.

- [ ] Demo Render + Vercel + Atlas + Cloudinary + MSG91 live  
- [ ] Smoke green on Demo URL  
- [ ] Mid-range Android APK against hosted API  
- [ ] 10-min demo script practiced on hosted stack  

---

# Y2-03 — Live Client #2

**Goal:** Repeatability proven with **paying** client (Acme dry-run already done).

- [ ] Signed quote + modules annex  
- [ ] `create-client` + provision + Codemagic flavor  
- [ ] Client-owned vendor accounts  
- [ ] Hours vs Ratnaraj logged  
- [ ] Update keep/kill with real Sold/Not sold  

---

# Y2-04 — Premium vendor wiring (only when sold)

- [ ] Live metals HTTP adapter for `FEATURE_RATE_API`  
- [ ] Live BSP/Meta send for `FEATURE_WHATSAPP_BUSINESS_API`  
- [ ] Flutter Razorpay Checkout SDK  
- [ ] Cost disclosure confirmed on invoice  

---

# Y2-05 — Socket.IO chat (paid upgrade)

- [ ] Spec + price  
- [ ] Implement only after Client pays  
- [ ] Keep polling as default  

---

# Y2-06 — Optional-if-sold differentiators

Pick **only** if quote includes them:

- [ ] Offline catalog (`FEATURE_OFFLINE_CATALOG`)  
- [ ] i18n Hindi-first (`FEATURE_I18N`)  
- [ ] Multi-branch (`FEATURE_MULTI_BRANCH`)  
- [ ] Savings scheme **tracker** (`FEATURE_SAVINGS_SCHEME`)  
- [ ] Explicitly **do not** build AR / AI / family vault without demand  

---

# Y2-07 — Dependency majors + automation

- [ ] firebase-admin 14 + FCM re-verify  
- [ ] Decide Express 5 / Next 16 / Sentry 10 windows  
- [ ] Dependabot or Renovate on api + admin  
- [ ] Re-run security audit note  

---

# Y2-08 — Docs & commercial refresh

- [ ] Rewrite keep/kill from invoices  
- [ ] Publish or scrap case study per permission  
- [ ] Refresh quote annex from actual close rates  
- [ ] Month calendar for Year-2 in [08](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md)  

---

## How to start

1. Sign [V2_PRIORITIES_DRAFT.md](./phase35/V2_PRIORITIES_DRAFT.md).  
2. Execute **Y2-01** in parallel with sales pipeline for Demo (Y2-02).  
3. Do not start Y2-04/05/06 without a paid module line.
