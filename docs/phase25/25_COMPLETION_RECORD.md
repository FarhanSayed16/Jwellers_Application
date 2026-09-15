# Phase 25 — Completion record

**Status:** ✅ Complete for engineering gate (2026-09-11)  
**Goal:** Template proven before client data — Demo dogfood + QA artifacts.

## Delivered

| § | Item | Evidence |
|---|---|---|
| 25.1 | Deploy Demo runbooks + configs | `DEPLOY_DEMO.md`, `render.yaml`, `apps/admin/vercel.json`, `apps/api/Dockerfile`, `APK_DISTRIBUTION.md` |
| 25.1 | Atlas / Cloudinary Demo path | Dedicated DB name + `CLIENT_SLUG=demo` folders documented |
| 25.1 | MSG91 / live hosts | ⏸ Deferred — accounts; bypass path documented |
| 25.2 | Full integration script | `npm run verify:phase25` (Flow 18) + `QA_CHECKLIST.md` |
| 25.2 | Demo catalog seed | `npm run seed:demo-catalog` |
| 25.3 | Bug bash | `BUG_BASH.md` — no open P0/P1 from API dogfood |
| 25.4 | QA sign-off + 10-min script | `QA_SIGNOFF.md`, `DEMO_SCRIPT_10MIN.md` |

## Commands

```bash
npm run verify:phase25 -w @jwellers/api
CLIENT_SLUG=demo npm run seed -w @jwellers/api
CLIENT_SLUG=demo npm run seed:demo-catalog -w @jwellers/api
SMOKE_BASE_URL=https://<demo-api> npm run smoke -w @jwellers/api
```

## Deferred to live accounts / device QA

- Click-through Render free + Vercel Hobby projects
- MSG91 Demo sender live SMS
- Mid-range Android visual pass on hosted API
