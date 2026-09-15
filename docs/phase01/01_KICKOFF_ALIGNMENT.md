# Phase 01 — Internal Kickoff Alignment

**Date locked:** 2026-09-07  
**Project:** Jewellery White-Label Multi-Instance App  
**Execution checklist:** [14_MASTER_EXECUTION_PLAN.md](../14_MASTER_EXECUTION_PLAN.md)

---

## 01.1 Locked decisions (confirmed)

| Decision | Locked value |
|---|---|
| Architecture | White-Label Multi-Instance (one monorepo template; dedicated infra per shop) |
| Not doing | Shared multi-tenant SaaS / shared customer DB |
| Mobile | Flutter (Dart) + flavors + Riverpod |
| Backend | Node.js + Express + TypeScript + Mongoose |
| Database | MongoDB Atlas — **one project/cluster per client** |
| Admin | Next.js App Router + Tailwind + TypeScript |
| API hosting | Render (Starter for production clients) |
| Admin hosting | Vercel Hobby (upgrade Pro only if needed) |
| Images | Cloudinary |
| Customer auth | Phone OTP via MSG91 |
| Push | FCM |
| First real client | Ratnaraj Jewellers |
| Template/demo brand | Demo Jewellers |
| v1 platforms | **Android only**; iOS deferred unless paid |

---

## Team roles (fill names)

| Role | Owner | Backup |
|---|---|---|
| Backend (API) | _TBD_ | |
| Admin (Next.js) | _TBD_ | |
| Mobile (Flutter) | _TBD_ | |
| Docs / QA / checklist | _TBD_ | |
| Client liaison (Ratnaraj) | _TBD_ | |

> Update names when the two developers confirm. Until then, checkpoint owner = whoever drives the weekly review.

---

## Communication & checkpoint

| Item | Agreement |
|---|---|
| Source of truth for tasks | `docs/14_MASTER_EXECUTION_PLAN.md` |
| Specs | `docs/01`–`13` |
| Weekly checkpoint | Review Phase progress table; tick/defer items; no silent skips |
| Channel | _TBD (WhatsApp group / Discord / email)_ |

---

## Sign-off (internal)

| Name | Role | Agrees stack + model | Date |
|---|---|---|---|
| | | [ ] Yes | |
| | | [ ] Yes | |
| | | [ ] Yes | |
