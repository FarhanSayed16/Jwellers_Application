# 08 — Enhancements, Missing Gaps & Month-by-Month Plan

**Source of truth for:** everything that makes the product more production-ready, more sellable, and clearer on *when* it gets built.  
**Does not replace** docs 01–07 — it extends them with gaps, polish, new ideas, and a calendar.  
**Related:** [04_FEATURES_AND_MODULES](./04_FEATURES_AND_MODULES.md) · [05_BUILD_ROADMAP](./05_BUILD_ROADMAP.md) · [07_FUTURE_AND_UPSCALING](./07_FUTURE_AND_UPSCALING.md)

---

## How to read this file

| Section | Use it for |
|---|---|
| §1 Production-readiness gaps | Things easy to forget that make the system “proper” |
| §2 Product enhancements | UX/ops improvements beyond the base feature list |
| §3 New sellable ideas | Differentiating packages you can quote to jewellers |
| §4 Month-by-month plan | What happens in Month 0 → Month 12 |
| §5 Sales packaging | How to name tiers so selling stays clear |
| §6 Decision log | Add new ideas here so docs never get jumbled again |

---

## 1. Production-readiness gaps (must not skip)

These are not flashy features — they are what separates a demo from a system you can sell and support.

### 1.1 Reliability & quality

| Gap | Why it matters | When |
|---|---|---|
| API error contract (`code`, `message`, `details`) | Flutter/admin can show clear errors; support can debug | Month 1 |
| Request ID / correlation ID in logs | Trace one failed OTP or chat across Render logs | Month 1–2 |
| Health + readiness endpoints | Render/uptime checks; `/health` + DB ping | Month 1 |
| Automated smoke tests post-deploy | Catch broken env after every client deploy | Month 2–3 |
| Sentry (or similar) per client DSN | Crash/API errors before the jeweller calls you | Month 3 |
| Backup policy documented | Atlas backups on; restore drill once | Month 2 |
| Image failure UX | Broken Cloudinary URL → placeholder, not blank grid | Month 2 |
| Empty states | No items / no chats / no rates — guided copy for retailer | Month 2 |

### 1.2 Admin usability (jewellers are not tech teams)

| Gap | Why it matters | When |
|---|---|---|
| Bulk CSV/Excel SKU import | First catalog load is painful item-by-item | Month 3–4 |
| Duplicate item / clone SKU | Faster catalog entry | Month 3 |
| Drag-and-drop category sort | Matches how they think about showcases | Month 3 |
| “Today’s rate” big button + confirm | Reduce wrong-rate mistakes | Month 2 |
| Undo / soft-delete restore for items | Accidental deletes are common | Month 2 (schema already has `deletedAt`) |
| Simple training PDF / 5-min loom videos | Cuts AMC support load | Month 3 (with Ratnaraj handoff) |
| Staff invite + permissions UI | Owner shouldn’t share one password | Month 4 |

### 1.3 Mobile polish

| Gap | Why it matters | When |
|---|---|---|
| Skeleton loaders / shimmer | Feels premium on jewellery photos | Month 2 |
| Pull-to-refresh on Home & rates | Expectation on rate apps | Month 2 |
| Deep links to item (`https://…/item/SKU` or app link) | QR module + WhatsApp shares need this | Month 4 (with QR) |
| App update force/soft prompt | Push critical fixes without waiting for users | Month 3 |
| Notification permission priming screen | Explain “rate alerts” before system dialog | Month 2 |
| Search: SKU + tags + title | Retail users search by design name or code | Month 2 |
| Filters: purity, metal, weight range, new/featured | Catalogs get large fast | Month 3 |

### 1.4 Business / sales ops (your side)

| Gap | Why it matters | When |
|---|---|---|
| Signed MSA + module annex template | Avoid scope fights | Month 0–1 |
| Client version register (which template tag each shop runs) | AMC upgrades without guessing | Month 3 |
| Quote calculator sheet (base + modules + AMC) | Faster closing | Month 1 |
| Demo script (10-minute walkthrough) | Repeatable sales | Month 3 (Demo Jewellers live) |

---

## 2. Product enhancements (make it “much more better”)

Improvements that sit on top of Core + modules in [04](./04_FEATURES_AND_MODULES.md).

### 2.1 Customer trust & conversion

| Enhancement | Description | Suggested flag / package |
|---|---|---|
| Price breakup always visible | Metal + making + GST line items on detail & calculator share card | Core polish |
| “Share rate card” image | Generate today’s rates as a shareable image/PDF | `FEATURE_SHARE_RATE_CARD` |
| Appointment booking | Book store visit slot; admin calendar | `FEATURE_APPOINTMENTS` |
| Try-at-home / visit request | Lead form with preferred date (not logistics full stack) | Part of appointments or custom requests |
| Favourites collections | Customer-named lists beyond wishlist | Later |
| Recently viewed | Local + optional server | Core polish |
| Trust strip | Years in business, BIS, COD/advance policy — editable in shop_config | Core |

### 2.2 Retailer daily workflow

| Enhancement | Description | Suggested flag |
|---|---|---|
| Morning rate ritual | One screen: set rates → preview → notify all | Core polish |
| Stock status | `active` / `sold` / `hold` with quick toggle | Core (status already in schema) |
| Customer tags | VIP / wedding season / wholesale enquiry | `FEATURE_CRM_LIGHT` |
| Follow-up reminders | Enquiry older than X days → admin reminder | `FEATURE_CRM_LIGHT` |
| Print tags | Label PDF with SKU, purity, weight, QR | Bundled with `FEATURE_ITEM_QR` |
| Making-charge schemes | Festival scheme % for a date range | `FEATURE_SCHEMES` |

### 2.3 Chat & messaging upgrades

| Enhancement | Description | When |
|---|---|---|
| Canned replies | “Rate today…”, “Visit store…”, “Photo received…” | Month 4 |
| Item card in chat | Staff attaches catalog item into thread | Month 5 |
| Chat → enquiry → invoice pipeline | One flow from talk to bill | Month 6–7 (billing module) |
| Unread badges on Chat tab | Non-negotiable polish | With Chat Phase A |
| Business hours auto-reply | Outside hours message | Month 5 |

### 2.4 Performance & scale (single client)

| Enhancement | Description | When |
|---|---|---|
| Pagination everywhere | Items, messages, audit logs | Month 1–2 |
| Cloudinary transforms | Thumb vs full; watermark transform | Month 2 |
| CDN caching headers on public catalog GETs | Faster Home | Month 3 |
| Rate limit on public APIs | Protect cheap hosting | Month 1 (with auth) |
| Archive sold items from default grids | Keep DB clean for browsing | Month 3 |

### 2.5 White-label / resale readiness

| Enhancement | Description | When |
|---|---|---|
| Remote theme refresh | Change colors without new Play build (within token set) | Month 3–4 |
| In-app “About powered by” optional | Off by default; some clients hate it, some accept cheaper deal | Config |
| Client onboarding wizard in admin | First-login checklist: logo → rates → first 10 items → push test | Month 4 |
| Module store page in admin | “Enable Digital Billing — contact support” with your pricing copy | Month 6 |

---

## 3. New ideas for selling (differentiation)

Ideas that make jewellers choose **you** over a generic catalogue app. Each should get a flag before you promise it on a call.

### 3.1 High-demand retail ideas (India jewellery)

| Idea | Pitch to jeweller | Complexity | Flag (proposed) |
|---|---|---|---|
| **Wedding / occasion boards** | “Bridal picks”, “Daily wear” curated rows on Home | Medium | `FEATURE_CURATED_BOARDS` |
| **Gold SIP / savings scheme tracker** | Customers track monthly saving scheme balance (jeweller enters ledger) | High | `FEATURE_SAVINGS_SCHEME` |
| **Melting / scrap buy estimate** | Walk-in scrap estimate (separate from old-gold exchange against new purchase) | Medium | `FEATURE_SCRAP_BUY` |
| **Jewellery care tips** | Content section builds trust; low cost | Low | Core content |
| **Festival campaign mode** | Diwali/Akshaya Tritiya: theme banner + scheme % + push | Medium | `FEATURE_SCHEMES` |
| **Family vault** | Shared family wishlist with invite code | Medium | `FEATURE_FAMILY_VAULT` |
| **Store mode tablet** | Large-font catalog for counter iPad/Android tablet | Medium | `FEATURE_STORE_MODE` |
| **WhatsApp catalogue sync assist** | Export selected items to CSV/images pack for WA catalog | Medium | Under WhatsApp pack |
| **Referral code** | Customer refers friend → retailer sees source | Low–Med | `FEATURE_REFERRALS` |
| **EMI eligibility info** | Static partner bank/NBFC info (not underwrite yourself) | Low | Content + flag |
| **Live store status** | Open/closed + today’s special rate note | Low | Core polish |
| **Weight-based price alerts** | “Notify me if 22K drops below X” | Medium | `FEATURE_PRICE_ALERTS` |

### 3.2 Premium / wow ideas (sell later, demo early)

| Idea | Note | Flag (proposed) |
|---|---|---|
| AR try-on (rings/earrings) | High cost; partner SDK; only for premium clients | `FEATURE_AR_TRYON` |
| 360° / short video per SKU | Storage heavy; Cloudinary video | `FEATURE_MEDIA_360` |
| AI similar designs | “More like this” from tags/embeddings | `FEATURE_AI_SIMILAR` |
| Voice rate enquiry | “What’s 22K today?” via assistant — novelty | Experimental |
| Multi-language with voice UI | Combines i18n + accessibility | After `FEATURE_I18N` |

### 3.3 Your-business ideas (sell the *system*, not one app)

| Idea | Why it helps closing deals |
|---|---|
| **Demo Jewellers** always live | Show, don’t slide-deck |
| **48-hour reskin preview** | Temporary flavor with their logo/colors on TestFlight/Internal testing |  
| **AMC tiers** | Bronze (bugs) / Silver (+1 module/year) / Gold (priority + quarterly upgrades) |
| **Catalog concierge** | Paid service: you upload first 200 SKUs from their photos | One-time SKU |
| **Photography checklist kit** | PDF + sample lightbox setup — free lead magnet |
| **Partner CA / MSG91 setup call** | Paid onboarding hour |

---

## 4. Month-by-month plan

Assumes part-time 2-dev capacity. Adjust dates; keep **order**.  
**Month 0** = planning week before coding.  
Aligns with [05](./05_BUILD_ROADMAP.md) but expands polish, gaps, and sales work.

### Month 0 — Lock & prepare

- Wireframes: Core screens + Chat + Admin key flows  
- Confirm Ratnaraj module flags ([04](./04_FEATURES_AND_MODULES.md) §11)  
- MSA / quote template draft  
- Collect branding + sample catalog photos  
- Monorepo skeleton created  

**Exit:** No stack debates; screen list signed off.

### Month 1 — Foundation

- Flavors + tokens + feature flag endpoint  
- Auth (admin + customer OTP + JWT) per [02](./02_AUTH_AND_SECURITY.md)  
- Mongoose models + indexes per [03](./03_DATA_MODEL.md)  
- Rates + categories + items CRUD APIs  
- Error contract, rate limits, `/health`  
- `.env.example` + Demo env on Render free  

**Exit:** API usable from Postman/Thunder Client; flags readable.

### Month 2 — Admin + Core app shell

- Admin: login, rate entry, catalog, branding, soft-delete restore  
- Flutter: Home, Collection, Item detail, Calculator, theme, skeletons, pull-to-refresh  
- Cloudinary signed upload + image guidance  
- Rate history + size guide  
- Public catalog pagination + search  

**Exit:** Demo catalog browsable end-to-end on device.

### Month 3 — Engagement + first “real product” feel

- OTP login, wishlist, enquire, WhatsApp deep links  
- Chat Phase A (REST + FCM + unread badges)  
- Push: rate update + new arrival  
- Privacy policy page + account deletion  
- Sentry + backup note + training videos draft  
- Demo Jewellers staging dogfood  

**Exit:** Internal dogfood complete; Play internal testing build.

### Month 4 — Ratnaraj go-live track

- Hallmark module if sold  
- Filters, clone SKU, bulk import (CSV)  
- Staff roles UI (basic)  
- Remote theme refresh  
- Play Console handoff under **client account**  
- Retailer training + handoff checklist ([06](./06_LEGAL_AND_COMPLIANCE.md))  
- Client version register started  

**Exit:** Ratnaraj live (or closed test → production).

### Month 5 — Stabilize + Chat upgrade path

- Bugfix from real usage  
- Canned replies + business hours auto-reply  
- Chat item-cards  
- Optional Chat Realtime (Socket.IO) if sold  
- `create-client` script v1  
- Sales demo script finalized  

**Exit:** AMC process exists; second-client spin-up documented.

### Month 6 — Monetization modules

- Digital billing PDF  
- Razorpay advance/booking (if demand)  
- Offers scheduling polish  
- Old-gold exchange calculator  
- Admin “module upsell” page (contact to enable)  
- First paid upsell attempt to Ratnaraj  

**Exit:** At least one paid module attach possible.

### Month 7 — Showroom bridge

- Item QR + deep links + print tags  
- Store mode (tablet) MVP  
- Curated boards (bridal / daily)  
- Share rate card image  
- Appointment booking (simple)  

**Exit:** Physical-store ↔ app loop is demonstrable.

### Month 8 — CRM-lite & retention

- Customer tags + follow-up reminders  
- Price alerts  
- Referral codes  
- Festival / schemes module  
- Analytics dashboard v1 (views, wishlists, enquiries)  

**Exit:** Retailer sees “why the app pays for itself.”

### Month 9 — Second client + ops maturity

- Onboard client #2 using checklist + scripts  
- Codemagic multi-flavor pipeline hardened  
- Template semver + upgrade playbook  
- WhatsApp catalogue export assist  
- i18n kickoff (Hindi first) if sold  

**Exit:** Proof that white-label is repeatable.

### Month 10 — Premium messaging & automation

- WhatsApp Business API broadcasts (rate morning pack)  
- Automated rate API module (optional)  
- Savings scheme tracker (if market pull)  
- Performance pass (caching, image sizes)  

**Exit:** “Premium” tier is real, not vapor.

### Month 11 — Differentiation pack

- Offline catalog  
- Multi-branch (only if a client paid)  
- Family vault or scrap-buy (pick by demand)  
- AI tagging / similar items experiment on Demo only  

**Exit:** Clear premium SKUs for year-2 sales.

### Month 12 — Productize the business

- Formal onboarding kit (one-day SLA)  
- AMC Bronze/Silver/Gold published prices  
- Case study from Ratnaraj (with permission)  
- Roadmap review → write next year’s Month plan in this file  
- Drop ideas that nobody bought; promote ones that closed deals  

**Exit:** Sellable product company rhythm, not one custom project.

---

## 5. Sales packaging (keep quotes clean)

Map work above into names clients understand.

| Package | Includes (summary) | Typical timing |
|---|---|---|
| **Launch** | Core + Chat A + WhatsApp links + Rate history + Size guide + dedicated deploy | Months 1–4 |
| **Showroom** | Launch + QR + print tags + curated boards + share rate card | Month 7+ |
| **Growth** | Showroom + analytics + CRM-lite + schemes + appointments | Month 8+ |
| **Premium** | Growth + billing/payments + WA Business / rate API + realtime chat | Month 6–10 |
| **Concierge add-ons** | Catalog upload service, photo kit, onboarding call | Anytime |

Every line on an invoice should map to a **flag** in [04](./04_FEATURES_AND_MODULES.md) or a new flag listed in §6 below.

---

## 6. Decision log — add new ideas here

When someone says “we should also add X”, add a row — do **not** scatter into old superseded files.

| Date | Idea | Keep? | Flag / package | Target month | Owner |
|---|---|---|---|---|---|
| 2026-09-06 | Doc set 01–08 created | Yes | — | — | — |
| 2026-09-06 | Share rate card | Yes | `FEATURE_SHARE_RATE_CARD` | 7 | TBD |
| 2026-09-06 | Appointments | Yes | `FEATURE_APPOINTMENTS` | 7 | TBD |
| 2026-09-06 | Savings scheme tracker | Maybe | `FEATURE_SAVINGS_SCHEME` | 10 | TBD |
| 2026-09-06 | Store mode tablet | Yes | `FEATURE_STORE_MODE` | 7 | TBD |
| 2026-09-06 | CRM-lite tags/reminders | Yes | `FEATURE_CRM_LIGHT` | 8 | TBD |
| 2026-09-06 | Price alerts | Yes | `FEATURE_PRICE_ALERTS` | 8 | TBD |
| 2026-09-06 | AR try-on | Later | `FEATURE_AR_TRYON` | 11+ | TBD |
| | | | | | |

**Rule:** New idea → row here → if approved, add flag to [04](./04_FEATURES_AND_MODULES.md) → schedule in §4.

---

## 7. Priority cheat sheet (if time is short)

**Never cut (production-proper):** auth limits, backups, delete-account, soft-delete, pagination, error handling, client-owned Play handoff.  

**Cut last (selling power):** Chat, rate history, WhatsApp links, hallmark (if they hallmark), calculator accuracy.  

**Cut first under pressure:** AR, AI, savings schemes, family vault, multi-branch, iOS.  

**Build next after Ratnaraj stabilizes:** bulk import, QR, old-gold exchange, billing, analytics.

---

## 8. Relationship to other docs

| Question | Doc |
|---|---|
| What is the locked architecture? | [01](./01_PRODUCT_AND_ARCHITECTURE.md) |
| How do auth & security work? | [02](./02_AUTH_AND_SECURITY.md) |
| Exact DB fields? | [03](./03_DATA_MODEL.md) |
| What flags exist & how to price modules? | [04](./04_FEATURES_AND_MODULES.md) |
| Engineering phase checklist? | [05](./05_BUILD_ROADMAP.md) |
| Legal / Play? | [06](./06_LEGAL_AND_COMPLIANCE.md) |
| Ops scaling & wave features? | [07](./07_FUTURE_AND_UPSCALING.md) |
| Gaps, extra ideas, **month calendar**, sales packages? | **This file (08)** |
