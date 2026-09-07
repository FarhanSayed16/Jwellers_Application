# 07 — Future Features & Upscaling

**Source of truth for:** what comes after first go-live, and how dedicated-infra ops stay sane as client count grows.  
**Related:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) · [04](./04_FEATURES_AND_MODULES.md) · [05](./05_BUILD_ROADMAP.md)

---

## 1. Principle

We **keep dedicated infrastructure per client** (isolation, customization, blast radius).  
Scaling means **better packaging and automation**, not collapsing everyone onto one shared database.

---

## 2. Ops scaling (while staying dedicated)

| Client count | Practice |
|---|---|
| 1 (Ratnaraj) | Manual checklist from [01](./01_PRODUCT_AND_ARCHITECTURE.md) is fine |
| 2–5 | Shell/Node scripts: create flavor folder, `.env` from template, print deploy steps |
| 5–15 | Codemagic matrices per flavor; GitHub Actions deploy per client project; changelog + semver on template |
| 15+ | Internal “onboarding kit”: one-day SLA checklist, status board of client versions, paid AMC tiers tied to upgrade cadence |

### Template upgrade flow

1. Develop on `demo` / staging  
2. Tag release `template@x.y.z`  
3. For each AMC client: merge/tag → run migrations on **their** Atlas → deploy **their** Render/Vercel → build **their** flavor → staged Play rollout  

Never silently push breaking changes to all clients without AMC agreement.

For the full **month-by-month calendar**, extra polish gaps, and new sellable ideas (appointments, savings schemes, store mode, etc.), use [08_ENHANCEMENTS_AND_MONTHLY_PLAN](./08_ENHANCEMENTS_AND_MONTHLY_PLAN.md).

### What we automate first

1. `npm/pnpm` script: `create-client --slug ratnaraj`  
2. `.env.example` → validated required keys  
3. Codemagic flavor build  
4. DB migrate runner that takes `MONGODB_URI` as input  
5. Post-deploy smoke script (health + public config + login)  

---

## 3. Chat upgrades

| Stage | Deliverable | Sell as |
|---|---|---|
| A (launch) | REST threads + FCM | Core/Pro module |
| B | WebSocket / Socket.IO real-time | Chat Realtime upgrade |
| C | Staff mobile replies + assignment | Staff pack |
| D | WhatsApp Business bridge | Premium messaging |

Same `chat_threads` / `chat_messages` models — see [03](./03_DATA_MODEL.md).

---

## 4. Feature roadmap (post-MVP)

### Wave 1 — quick wins after Ratnaraj is live

- Offers scheduling polish  
- Custom requests form polish  
- Rate History UX polish  
- Hallmark fields if not launched  
- Old-gold exchange calculator (`FEATURE_OLD_GOLD_EXCHANGE`)  
- Item QR codes (`FEATURE_ITEM_QR`)  

### Wave 2 — revenue modules

- Digital billing PDF pack  
- Razorpay advance payments  
- Automated rate API + margin  
- Analytics dashboard (`FEATURE_ANALYTICS`) using `feature_events`  

### Wave 3 — platform differentiators

- Offline catalog (Hive/Isar)  
- Multi-language (HI/MR/GU/UR)  
- Multi-branch  
- WhatsApp Business API broadcasts  
- Voice-to-catalog entry  
- AI photo → tags/description  
- Video/reel hero banners  
- AR / camera-assisted sizing (experimental)  

Each wave item gets a flag (existing or new) before sales promises.

---

## 5. Demo Jewellers (permanent)

Keep one **Demo** deployment on Render free tier:

- Sales demos with live reskin of tokens where possible  
- CI target before client production  
- Safe place to try Wave features behind flags  

---

## 6. Multi-branch design hook (do not fully build until sold)

When `FEATURE_MULTI_BRANCH=true` later:

- `branches` collection  
- `rates.branchId` optional  
- `items` visibility per branch or shared catalog + stock by branch  
- Customer app: branch picker or geo default  

Nullable `branchId` fields can be added in a controlled migration when first sold — avoid premature complexity in Ratnaraj schema unless they already need it.

---

## 7. Monitoring & reliability (per client)

Add as AMC matures:

- Uptime check on `/health`  
- Error tracking (Sentry) with DSN per client project  
- Atlas alerts on disk/connections  
- MSG91 balance alerts (client responsibility; remind in training)  

Failure on one client remains isolated by design.

---

## 8. When dedicated infra might be revisited

Only consider a **control-plane** (your internal dashboard that provisions client stacks) — still not a shared customer DB.  
True multi-tenant SaaS is out of scope unless the business model deliberately changes and docs 01–07 are rewritten under a new version.

---

## 9. Success metrics (product)

Per client:

- Retailer updates rates without calling you  
- Catalogue grows weekly  
- Enquiries/chats from app  
- OTP cost stays within expected band  
- Play listing live under their brand  

Per your business:

- Second client spin-up time &lt; first  
- AMC attach rate  
- Module attach rate (chat realtime, billing, payments, WhatsApp API)
