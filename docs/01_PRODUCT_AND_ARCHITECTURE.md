# 01 — Product & Architecture

**Source of truth for:** product model, dedicated infrastructure, tech stack, branding, environments, deployment, base costs.  
**Related:** [04_FEATURES_AND_MODULES](./04_FEATURES_AND_MODULES.md) · [05_BUILD_ROADMAP](./05_BUILD_ROADMAP.md) · [07_FUTURE_AND_UPSCALING](./07_FUTURE_AND_UPSCALING.md)

---

## 1. What we are building

A **white-label jewellery retail product**: one master template codebase, redeployed as a **fully separate application** for each jeweller.

Each client (starting with **Ratnaraj Jewellers**) receives:

| Asset | Ownership |
|---|---|
| Android app (own name, icon, listing) | Client’s Google Play Console |
| Backend API | Client’s Render service |
| Database | Client’s MongoDB Atlas project |
| Admin panel (web) | Client’s Vercel project |
| Images / media | Client’s Cloudinary account (or dedicated folder) |
| OTP SMS / WhatsApp sender | Client’s MSG91 (and related) accounts |

This is **not** multi-tenant SaaS. There is no shared database, no `tenant_id`, and no shared Play listing.

**What you sell:** build + branding + deployment + optional AMC + optional feature modules.  
**What stays yours:** the master template. Improvements can be rolled to new clients and offered as paid upgrades to existing ones.

---

## 2. Why dedicated infrastructure (locked decision)

Dedicated infra is the product model — not a temporary compromise.

| Benefit | Why it matters |
|---|---|
| **Data isolation** | Client A’s catalog, customers, rates, chats never touch Client B |
| **Blast radius** | Outage, misconfig, or breach on one stack affects **only that client** |
| **Per-client customization** | Different modules, themes, integrations without contaminating others |
| **Client ownership** | Feels like “my app”; they pay their own hosting/SMS bills |
| **Compliance clarity** | Easier to answer “where is my data?” for jewellers |

**Ops cost of this model is real** (N clients ≈ N stacks). That is accepted. Scaling is solved by **automation and a single template repo**, not by merging clients onto one shared DB. See [07_FUTURE_AND_UPSCALING](./07_FUTURE_AND_UPSCALING.md).

---

## 3. Final tech stack (locked)

| Layer | Choice | Notes |
|---|---|---|
| Mobile (customer) | **Flutter (Dart)** | Flavors for per-client app ID, name, icon, splash, API URL |
| State management | **Riverpod** | Scales with features (chat, flags, rates) |
| Backend API | **Node.js + Express + TypeScript** | One language with admin; types catch config mistakes |
| ODM | **Mongoose** | Schema validation identical across deployments |
| Database | **MongoDB Atlas** | One project/cluster **per client** |
| Admin panel | **Next.js (App Router) + Tailwind + TypeScript** | Retailer desktop control center |
| Images | **Cloudinary** | `q_auto` / `f_auto`; high-res jewellery photos |
| Customer login | **Phone OTP via MSG91** | India pricing; shop-name sender ID when possible |
| Push | **Firebase Cloud Messaging (FCM)** | Via FlutterFire; independent of auth provider |
| Backend hosting | **Render** | Free = demo/staging only; **Starter (~$7/mo)** = production (no cold start) |
| Admin hosting | **Vercel Hobby (free)** | Enough for one retailer’s admin; Pro ($20) only if ToS/custom-domain needs force it |
| Payments | **Razorpay** | Off by default; env-flagged module |
| Backend/admin CI | **GitHub Actions** → Render / Vercel | |
| Mobile CI | **Codemagic** (or GHA + Fastlane) | Flavor → signed AAB |

**Not in stack:** React Native, FastAPI/Python, Railway (superseded earlier drafts).

---

## 4. White-label architecture

### 4.1 Build-time: Flutter flavors

Each client = one **flavor**:

- Application ID (e.g. `com.ratnaraj.jewellers`)
- App display name
- Icons + splash
- Base API URL
- Optional Firebase/Google services files per flavor

One codebase → many store listings. Prefer **one template monorepo** with `clients/<slug>/` config packages — **do not fork** the whole repo per client unless they pay for permanent custom divergence.

### 4.2 Runtime: config + design tokens

App loads shop branding from backend `shop_config` (and/or bundled defaults):

- Logo URL, shop name, contact, address, GST, social links
- **Light palette + dark palette** (both defined explicitly; never auto-derived only)
- All UI colors/spacing/radii use **named tokens** (`color.primary`, `color.background`, …)

Theme modes: system / light / dark.

### 4.3 Feature modules via `.env`

Boolean flags on the backend control paid/optional modules. Exposed to app/admin via public `GET /config/features` (booleans + public values only — **never secrets**).  
Full list and pricing: [04_FEATURES_AND_MODULES](./04_FEATURES_AND_MODULES.md).

### 4.4 Core discipline

Core screens, business logic, API routes, and schemas stay **identical** across clients. Only flavor assets, env vars, and `shop_config` change. If that discipline breaks once, white-label becomes one-off custom builds.

---

## 5. Reference product (feature audit)

Inspired by apps like Ratnaraj Jewellers. Observed surfaces:

| Screen | Elements |
|---|---|
| Home | Logo/name, call, notifications, hero, search, gold/silver rates, new arrivals, featured, category rows |
| Collection | Top-level category grid |
| Category → subcategory | Design-type grid |
| Item grid | SKUs, wishlist, watermarked photos, filter/search |
| Calculator | Today’s rate, purity, weight, making %, GST %, calculate |
| Account | Profile, wishlist, enquiries, custom requests, offers, rate history, about, logout |
| Tabs | Home / Collection / Calculator / **Chat** |

Implied: item detail, admin panel for rates/catalog/banners/offers.

---

## 6. Environments

| Environment | Purpose |
|---|---|
| **Development** | Local Flutter + local Express; shared internal template Atlas + Cloudinary folder; **never** real client data |
| **Staging / Demo** | Permanent “Demo Jewellers” instance on Render **free** tier; CI smoke tests + sales demo |
| **Production (per client)** | Render Starter + client Atlas + client Cloudinary + Vercel Hobby + client Flutter flavor on their Play Console |

---

## 7. New-client deployment checklist

1. Collect branding (logo, light/dark tokens, shop details, GST, contacts).
2. Decide **which feature modules** are ON at launch; set env flags; quote accordingly ([04](./04_FEATURES_AND_MODULES.md)).
3. Provision MongoDB Atlas project (client-owned).
4. Provision Cloudinary (client-owned or managed folder with written handoff plan).
5. Create Render web service (Starter for production); set all env vars (DB, Cloudinary, MSG91, JWT secrets, feature flags).
6. Create Vercel project for admin; point at client API URL.
7. Add Flutter flavor + assets + API URL.
8. Run CI → signed AAB; upload to **client’s** Play Console.
9. Complete legal assets ([06_LEGAL_AND_COMPLIANCE](./06_LEGAL_AND_COMPLIANCE.md)).
10. Smoke-test: rates → catalog → calculator → OTP → wishlist → enquire → chat (if on) → flagged modules.
11. Train retailer on admin (including module expectations).
12. Document friction → feed into onboarding kit ([07](./07_FUTURE_AND_UPSCALING.md)).

---

## 8. Base running-cost matrix (infrastructure only)

All billed to **client accounts**. Feature/module surcharges are separate ([04](./04_FEATURES_AND_MODULES.md)).

| Resource | Unit cost (approx.) |
|---|---|
| MSG91 OTP | ₹0.18–0.25 / SMS |
| MongoDB Atlas | Free M0 → ~$9 M2 → ~$57+ M10 |
| Cloudinary | Free → ~$89+ when over free credits |
| Render | Free (demo only) → **$7/mo Starter** (production) → higher as needed |
| Vercel | **Hobby free** → $20 Pro if required |
| Play Console | $25 one-time (client) |
| Apple Developer | $99/year only if iOS requested |
| Codemagic | Free tier → ~$28/mo if volume grows |

**Per-client monthly ballpark (infra, before module add-ons):**

| Tier | Approx. total / month |
|---|---|
| Starter (&lt;1k customers, &lt;500 items) | ~$9–12 |
| Growing | ~$30–70 |
| Established | ~$190–200+ |

---

## 9. Your fee structure (business)

- **One-time build + deployment** — branding, initial catalog structure, provisioning, Play launch, modules chosen at launch.
- **Optional AMC** — bug fixes, small changes, template upgrades rolled into their stack.
- **Optional modules** — priced from the feature catalog in [04](./04_FEATURES_AND_MODULES.md).

Sell a clear package for Ratnaraj first; do not bury Phase-2/3 premiums inside the first quote unless explicitly sold.

---

## 10. Repo layout (recommended from day one)

```
/
  apps/
    api/          # Express + TypeScript
    admin/        # Next.js
    mobile/       # Flutter (flavors)
  packages/
    shared-types/ # optional shared DTOs
  clients/
    demo/
    ratnaraj/
      flavor/     # icons, splash, dart define / config
      branding/   # token values reference
  docs/           # this documentation set
```

Automation (scripts for “create client from template”) can start simple and grow — see [07](./07_FUTURE_AND_UPSCALING.md).
