# 04 — Features, Modules & Client Pricing

**Source of truth for:** what ships, what is env-flagged, how you price clients, and **chat**.  
**Related:** [01_PRODUCT_AND_ARCHITECTURE](./01_PRODUCT_AND_ARCHITECTURE.md) · [03_DATA_MODEL](./03_DATA_MODEL.md) · [07_FUTURE_AND_UPSCALING](./07_FUTURE_AND_UPSCALING.md)

---

## 1. Pricing philosophy

Infrastructure costs (Render, Atlas, SMS, etc.) are paid by the **client**.  
Your fees are:

1. **Base package** — template branded + deployed with **Core** features  
2. **Module add-ons** — toggled via `.env` / admin; priced separately (one-time and/or AMC uplift)  
3. **AMC** — maintenance + template upgrades  

Every sellable capability must map to either **Core** or a named **Module flag** so quotes stay clear.

---

## 2. Feature flags (environment-driven)

Backend reads flags from env, exposes:

`GET /config/features` → booleans + public values only (never secrets).

| Env flag | Default | Module name |
|---|---|---|
| `FEATURE_CHAT` | `true` (recommended for full product) | In-app Chat |
| `FEATURE_HALLMARK` | `false` | BIS Hallmark / HUID display |
| `FEATURE_DIGITAL_BILLING` | `false` | Digital GST invoices (PDF) |
| `FEATURE_RAZORPAY_PAYMENTS` | `false` | Advance / booking payments |
| `FEATURE_WHATSAPP` | `true` | WhatsApp `wa.me` deep links |
| `FEATURE_RATE_API` | `false` | Automated live rate feed |
| `FEATURE_OFFERS` | `true` | Offers / banners manager |
| `FEATURE_CUSTOM_REQUESTS` | `true` | Structured custom requests |
| `FEATURE_MULTI_BRANCH` | `false` | Multi-branch |
| `FEATURE_ANALYTICS` | `false` | Retailer analytics dashboard |
| `FEATURE_CRM_LIGHT` | `false` | Customer tags + enquiry follow-ups |
| `FEATURE_WHATSAPP_BUSINESS_API` | `false` | Paid WhatsApp Business broadcasts |
| `FEATURE_OLD_GOLD_EXCHANGE` | `false` | Old-gold exchange calculator |
| `FEATURE_ITEM_QR` | `false` | Per-item printable QR codes |
| `FEATURE_SHARE_RATE_CARD` | `false` | Shareable today’s rates HTML/card |
| `FEATURE_APPOINTMENTS` | `false` | Store visit booking |
| `FEATURE_STORE_MODE` | `false` | Tablet counter catalog mode |
| `FEATURE_CURATED_BOARDS` | `false` | Admin-curated Home occasion rows |
| `FEATURE_SCHEMES` | `false` | Festival / making schemes |
| `FEATURE_REFERRALS` | `false` | Customer referral codes |
| `FEATURE_PRICE_ALERTS` | `false` | Rate drop alerts |
| `FEATURE_OFFLINE_CATALOG` | `false` | Offline-first catalog cache |
| `FEATURE_I18N` | `false` | Hindi / Marathi / Gujarati / Urdu |
| `FEATURE_SIZE_GUIDE` | `true` | Size guide + estimator |
| `FEATURE_RATE_HISTORY` | `true` | Customer rate history charts |

Turning a module on/off = env change + redeploy (and ensure schema/UI already supports it). Prefer building module **boundaries** early even if UI ships behind flag.

---

## 3. Core package (always on — base quote)

These are included in the standard white-label deployment fee unless a written contract strips them.

### 3.1 Admin (retailer)

| Feature | Description |
|---|---|
| Admin login | Owner (and later staff) auth — see [02](./02_AUTH_AND_SECURITY.md) |
| Dashboard | Counts: items, new enquiries, open chats, today’s rate |
| Manual rate entry | 24K / 22K / 18K gold + silver; append-only history |
| Catalog CRUD | Categories → subcategories → items |
| Image upload | Cloudinary signed uploads; guidance for ~1500×1500+, clean background, multiple angles |
| Making charges | Shop default + per-item override (`percent` / `flat` / `inherit`) |
| Branding settings | Logo, light + dark tokens, shop details, GST |
| Enquiry inbox | List / status / assign (basic) |
| Push trigger | “Notify customers of new rate” / new arrival (basic broadcast) |

### 3.2 Customer app (Flutter)

| Feature | Description |
|---|---|
| Home | Rates, new arrivals, featured, category shortcuts, hero image/banner |
| Collection browse | Category → subcategory → item grid + search/filter basics |
| Item detail | Gallery, SKU, weights, purity, price breakup, enquire CTA |
| Price calculator | Live/manual today’s rate, purity, weight, making %, GST % |
| Rate history | Chart/list of recent rates (data already stored) |
| Size guide + estimator | Ring / bangle / chain reference + measurement → size |
| Wishlist | Per logged-in customer |
| Phone OTP login | MSG91 |
| Light / dark mode | Token-based |
| Push receive | Rate / arrival notifications |
| Own Play listing | Client developer account |

### 3.3 Platform

| Feature | Description |
|---|---|
| Dedicated infra | Own Render + Atlas + Vercel + Cloudinary + flavor build |
| Public config API | Theme + shop info + feature flags |
| Demo-quality smoke tests | Before handoff |

---

## 4. Module catalog (sell / toggle)

Use this table for client quotes. Amounts are **suggested placeholders** — replace with your real price list.

| Module | Flag | What client gets | Suggested pricing model | Ongoing client cost |
|---|---|---|---|---|
| **In-app Chat** | `FEATURE_CHAT` | Threaded chat with staff; FCM nudges; see §5 | Include in “Pro” base **or** add-on one-time + small AMC uplift | Render resources only (no SMS) |
| **WhatsApp deep links** | `FEATURE_WHATSAPP` | `wa.me` enquire / share price / share bill | Low add-on or included | ₹0 API (user’s WhatsApp) |
| **Hallmark / HUID** | `FEATURE_HALLMARK` | HUID + BIS no. + stamp photo; trust badge; guide to BIS Care verify | Add-on | ₹0 |
| **Digital billing** | `FEATURE_DIGITAL_BILLING` | GST-style PDF invoice on sale/enquiry convert | Add-on | Cloudinary storage |
| **Razorpay payments** | `FEATURE_RAZORPAY_PAYMENTS` | Advance/booking pay in app | Add-on + setup | Razorpay MDR |
| **Offers manager** | `FEATURE_OFFERS` | Scheduled banners/offers | Often in Core | — |
| **Custom requests** | `FEATURE_CUSTOM_REQUESTS` | Form + reference photos | Often in Core | Cloudinary |
| **Automated rate API** | `FEATURE_RATE_API` | Metals API + retailer margin | **₹25,000** one-time | Client metals API ~₹800–4,000/mo |
| **Multi-branch** | `FEATURE_MULTI_BRANCH` | Branches, rates/catalog scoping | Premium | Higher DB tier possible |
| **Analytics** | `FEATURE_ANALYTICS` | Views, wishlists, enquiry conversion | Premium / Phase 3 | — |
| **CRM-lite** | `FEATURE_CRM_LIGHT` | Customer tags + follow-ups | Add-on | — |
| **Schemes** | `FEATURE_SCHEMES` | Festival making offers | Add-on | — |
| **Referrals** | `FEATURE_REFERRALS` | Share codes / attribution | Add-on | — |
| **Price alerts** | `FEATURE_PRICE_ALERTS` | Alert when rate ≤ threshold | Add-on | — |
| **WhatsApp Business API** | `FEATURE_WHATSAPP_BUSINESS_API` | Automated rate/offer broadcasts | **₹35,000** one-time | Meta/BSP fees (Client) |
| **Old-gold exchange** | `FEATURE_OLD_GOLD_EXCHANGE` | Exchange value calculator + history | Add-on USP | — |
| **Item QR** | `FEATURE_ITEM_QR` | Printable QR → item detail | Add-on | — |
| **Share rate card** | `FEATURE_SHARE_RATE_CARD` | Today’s rates share/print card | Add-on | — |
| **Appointments** | `FEATURE_APPOINTMENTS` | Store visit booking + admin list | Add-on | — |
| **Store mode** | `FEATURE_STORE_MODE` | Tablet-friendly catalog | Add-on | — |
| **Curated boards** | `FEATURE_CURATED_BOARDS` | Occasion rows on Home | Add-on | — |
| **Offline catalog** | `FEATURE_OFFLINE_CATALOG` | Hive/Isar cache | Add-on | Device storage |
| **i18n** | `FEATURE_I18N` | HI / MR / GU / UR | Add-on | — |

### Quote template (copy for sales)

```
Base package (Core + dedicated deploy):  ₹1,49,000
Modules at launch:
  [ ] Chat .................... ₹15,000
  [ ] WhatsApp deep links ..... ₹5,000
  [ ] Hallmark/HUID ........... ₹8,000
  [ ] Digital billing ......... ₹40,000
  [ ] Razorpay ................ ₹25,000
  [ ] Rate API ................ ₹25,000 (+ Client metals ~₹800–4,000/mo)
  [ ] WA Business API ......... ₹35,000 (+ BSP/Meta conversation fees)
  [ ] Other: ____________ ..... ₹ ______
AMC (annual): Bronze ₹25,000 / Silver ₹45,000 / Gold ₹75,000
Client monthly infra (est.): ......... ~$9–12 starter (see RUNNING_COSTS)
```

---

## 5. Chat mechanism (required design)

Chat is a **first-class module**. Recommended default: **ON** for Ratnaraj-class full apps so the bottom **Chat** tab is real (not empty).

### 5.1 Product behavior

| Capability | MVP chat (ship) | Later upgrade |
|---|---|---|
| Customer starts thread | From Chat tab (general) or Item detail (“Chat about this item”) | — |
| Message types | Text + image attachments | Voice notes, catalog cards |
| Retailer replies | Admin Chat inbox (Next.js) | Mobile staff app |
| Notifications | FCM when other side sends | WhatsApp mirror |
| States | open / pending_customer / pending_staff / closed | assignment rules |
| History | Full thread persisted | Export / search |

### 5.2 Technical approach (phased, same data model)

**Phase A — Production-ready MVP chat (build with Core app)**  

- REST APIs: create/list threads, list messages (cursor pagination), send message, mark read  
- Idempotency via `clientMessageId`  
- Flutter: Chat tab = thread list + conversation screen  
- Admin: inbox + thread view  
- Delivery feel: FCM data message → app refreshes thread  
- AuthZ rules in [02](./02_AUTH_AND_SECURITY.md)  

**Phase B — Real-time**  

- Add Socket.IO (or WebSockets) on same `chat_*` collections  
- Typing indicators, online presence (optional)  
- No schema rewrite  

**Phase C — Omnichannel (optional paid)**  

- Bridge notifications to WhatsApp Business API  
- Still keep in-app thread as system of record  

### 5.3 APIs (contract sketch)

```
POST   /chat/threads                 { itemId?, subject? }
GET    /chat/threads                 ?cursor=
GET    /chat/threads/:id/messages    ?cursor=
POST   /chat/threads/:id/messages    { body?, attachmentUrls[], clientMessageId }
POST   /chat/threads/:id/read
PATCH  /chat/threads/:id             { status }   # staff
GET    /admin/chat/threads           # staff inbox
```

### 5.4 UX rules

- If `FEATURE_CHAT=false`, hide Chat tab; Enquire + optional WhatsApp remain.  
- If `FEATURE_CHAT=true` and `FEATURE_WHATSAPP=true`, item detail can offer **both** “Chat in app” and “Continue on WhatsApp”.  
- Do not show a dead Chat tab.

### 5.5 Costing chat to clients

- No per-message SMS fee (unlike OTP).  
- Cost = engineering in base/Pro package + slight AMC uplift for support.  
- Real-time (Phase B) can be a paid upgrade if not in initial quote.

---

## 6. Hallmark / HUID (compliance-honest)

When ON:

- Item fields: `huid`, `hallmarkImageUrl`; shop `bisRegistrationNumber`  
- UI: trust badge on detail; short copy: customer should verify HUID in official **BIS Care** app  
- **No** fake “verified by us via BIS API” claim (no public third-party verify API)

---

## 7. Digital billing & payments

- Billing: generate PDF (item, weight, purity, rate snapshot, making, GST breakup) → Cloudinary URL → share (app / WhatsApp)  
- Payments: server-created Razorpay orders; webhook verification; link to enquiry/invoice  

Both off by default until sold.

---

## 8. WhatsApp (free deep link vs paid API)

| Mode | Flag | Use |
|---|---|---|
| Free `wa.me` | `FEATURE_WHATSAPP` | Prefill enquire text with SKU + link; share bill/price |
| Paid Business API | `FEATURE_WHATSAPP_BUSINESS_API` | Automated broadcasts (rates, offers) |

---

## 9. Navigation map (customer app)

| Tab | When shown |
|---|---|
| Home | Always |
| Collection | Always |
| Calculator | Always |
| Chat | Only if `FEATURE_CHAT=true` |

Account drawer: Wishlist, Enquiries, Custom Requests (if flag), Offers (if flag), Rate History (if flag), About, Theme, Log out.

---

## 10. USP backlog (market differentiation)

Build after Core + Chat are stable; sell as modules when ready:

1. Old-gold exchange calculator  
2. Item QR for showcase tags  
3. Offline catalog  
4. Multi-language  
5. Voice-to-catalog (retailer)  
6. AI description/tagging from photo  
7. Automated morning rate broadcast (needs Business API or FCM)

Details and sequencing: [07_FUTURE_AND_UPSCALING](./07_FUTURE_AND_UPSCALING.md).

---

## 11. Ratnaraj recommended launch profile

Suggested flags for first full client (adjust after their yes/no):

```bash
FEATURE_CHAT=true
FEATURE_WHATSAPP=true
FEATURE_RATE_HISTORY=true
FEATURE_SIZE_GUIDE=true
FEATURE_OFFERS=true
FEATURE_CUSTOM_REQUESTS=true
FEATURE_HALLMARK=true          # if they hallmark stock
FEATURE_DIGITAL_BILLING=false  # enable when they commit to digital invoices
FEATURE_RAZORPAY_PAYMENTS=false
FEATURE_RATE_API=false
FEATURE_MULTI_BRANCH=false
FEATURE_ANALYTICS=false
FEATURE_CRM_LIGHT=false
FEATURE_WHATSAPP_BUSINESS_API=false
FEATURE_OLD_GOLD_EXCHANGE=false
FEATURE_ITEM_QR=false
FEATURE_SHARE_RATE_CARD=false
FEATURE_APPOINTMENTS=false
FEATURE_STORE_MODE=false
FEATURE_CURATED_BOARDS=false
FEATURE_SCHEMES=false
FEATURE_REFERRALS=false
FEATURE_PRICE_ALERTS=false
FEATURE_OFFLINE_CATALOG=false
FEATURE_I18N=false
```

Quote Core + Chat + WhatsApp + Hallmark (if yes) as a clear package; keep billing/payments as upsell.
