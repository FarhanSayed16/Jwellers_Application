# Quote / Module Annex Template

**Client:** _______________________  
**Date:** _______________________  
**Valid until:** _______________________  
**Prepared by:** _______________________  

Architecture: **White-Label Multi-Instance** — dedicated app, DB, backend, and Play listing per client.

---

## A. Base package (Core + dedicated deploy)

| Item | Included | Fee (₹) |
|---|---|---|
| Branding (logo, light/dark tokens, shop details) | Yes | 40,000 |
| Dedicated MongoDB Atlas + Render + Vercel + Cloudinary setup assist | Yes | included |
| Admin panel (rates, catalog, branding, enquiries) | Yes | included |
| Customer Android app (Home, Collection, Item, Calculator, Rate history, Size guide, Wishlist, OTP, Enquire) | Yes | included |
| Push notifications (FCM) basic | Yes | included |
| Play Store listing assistance under **Client** account | Yes | included |
| **Base subtotal** | | **₹1,49,000** |

> Adjust base for scope; **₹1,49,000** is the working list price for a single-shop Android Core package (2026).

---

## B. Modules at launch (tick + price)

| On? | Module | Flag | Fee (₹) | Notes |
|---|---|---|---|---|
| [ ] | In-app Chat (Phase A) | `FEATURE_CHAT` | 15,000 | Recommended ON |
| [ ] | WhatsApp deep links | `FEATURE_WHATSAPP` | 5,000 | Recommended ON |
| [ ] | Hallmark / HUID | `FEATURE_HALLMARK` | 8,000 | If they hallmark stock |
| [ ] | Offers manager | `FEATURE_OFFERS` | 8,000 | Often included |
| [ ] | Custom requests | `FEATURE_CUSTOM_REQUESTS` | 10,000 | Often included |
| [ ] | Size guide | `FEATURE_SIZE_GUIDE` | — | Usually in Core |
| [ ] | Rate history | `FEATURE_RATE_HISTORY` | — | Usually in Core |
| [ ] | Digital billing | `FEATURE_DIGITAL_BILLING` | 40,000 | Admin + customer invoice view — see `phase30/CA_GST_NOTE.md` |
| [ ] | Razorpay payments | `FEATURE_RAZORPAY_PAYMENTS` | 25,000 | Checkout when keys live; mock without keys |
| [ ] | Old-gold exchange | `FEATURE_OLD_GOLD_EXCHANGE` | 20,000 | Upsell — estimate + history + admin queue |
| [ ] | Chat realtime (Socket.IO) | _(paid upgrade)_ | 30,000 | Deferred — polling default |
| [ ] | Automated rate API | `FEATURE_RATE_API` | **25,000** | Mock until `RATE_API_DRY_RUN=false` + key; + Client metals ~₹800–4,000/mo |
| [ ] | WhatsApp Business API | `FEATURE_WHATSAPP_BUSINESS_API` | **35,000** | Dry-run default; marketing opt-in required; + BSP/Meta fees |
| [ ] | Item QR / print tags | `FEATURE_ITEM_QR` | 15,000 | Showroom |
| [ ] | Share rate card | `FEATURE_SHARE_RATE_CARD` | 8,000 | Showroom |
| [ ] | Appointments | `FEATURE_APPOINTMENTS` | 12,000 | Showroom / Growth |
| [ ] | Store mode | `FEATURE_STORE_MODE` | 10,000 | Showroom |
| [ ] | Curated boards | `FEATURE_CURATED_BOARDS` | 10,000 | Showroom |
| [ ] | Analytics | `FEATURE_ANALYTICS` | 20,000 | Growth |
| [ ] | CRM-lite | `FEATURE_CRM_LIGHT` | 18,000 | Growth |
| [ ] | Festival schemes | `FEATURE_SCHEMES` | 12,000 | Growth — making % on calculator |
| [ ] | Referrals | `FEATURE_REFERRALS` | 10,000 | Tracking-only — no automatic credits |
| [ ] | Price alerts | `FEATURE_PRICE_ALERTS` | 12,000 | Growth |
| [ ] | Other: ___________ | | | |
| | **Modules subtotal** | | **₹ ______** | |

---

## C. AMC (optional)

| Tier | Fee (₹ / year) | Selected |
|---|---|---|
| Bronze | **25,000** | [ ] |
| Silver | **45,000** | [ ] |
| Gold | **75,000** | [ ] |
| None (warranty only) | — | [ ] |

See `AMC_TIERS.md`.

---

## D. Totals

| | Amount |
|---|---|
| Base | ₹ ______ |
| Modules | ₹ ______ |
| AMC (if prepaid) | ₹ ______ |
| **Grand total** | **₹ ______** |
| Payment terms | e.g. 50% start / 50% on Play testing build |

---

## E. Client monthly infra (estimate — paid by Client to vendors)

Starter ballpark **~$9–12 / month** (Render Starter + Vercel Hobby + Atlas M0 + low OTP).  
See `RUNNING_COSTS.md`. Not included in Provider fee unless stated.

---

## F. Platforms

- [x] Android (v1)  
- [ ] iOS (extra quote: Apple Developer $99/yr + build/QA)

---

## G. Acceptance

Client confirms modules above are the launch scope.

| | Provider | Client |
|---|---|---|
| Name | | |
| Date | | |
| Sign | | |
