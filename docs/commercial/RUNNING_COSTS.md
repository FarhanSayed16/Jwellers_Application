# Running-Cost Expectation Sheet (Client-facing)

**Purpose:** Set expectations before go-live. These bills are paid by the **Client** on their own vendor accounts under the dedicated-infra model.

---

## Unit costs (approx., India-focused)

| Resource | Unit cost |
|---|---|
| MSG91 OTP SMS | ~₹0.18–0.25 per SMS |
| MongoDB Atlas | Free (M0) → ~$9/mo (M2) → ~$57+/mo (M10) |
| Cloudinary | Free tier → ~$89+/mo when exceeded |
| Render (API) | **~$7/mo Starter** for production (always-on) |
| Vercel (Admin) | **Hobby free** → $20/mo Pro if needed |
| Google Play Console | $25 one-time |
| Apple Developer | $99/year only if iOS |
| Firebase Cloud Messaging | Free |
| Razorpay (if enabled) | MDR per transaction |
| Live rate API (if enabled) | ~₹800–4,000/mo (~$10–50) — **Client-paid** vendor |
| WhatsApp Business / BSP (if enabled) | BSP platform ~₹999–5,000+/mo + Meta ~₹0.30–1.50/conversation — **Client-paid** |

See `docs/phase34/RATE_API_COST_DISCLOSURE.md` and `docs/phase34/BSP_SETUP_GUIDE.md`.

---

## Monthly ballpark by shop size

| Component | Starter (&lt;1k customers, &lt;500 items) | Growing | Established |
|---|---|---|---|
| MongoDB Atlas | Free | Free–$9 | $57+ |
| Cloudinary | Free | Free–$89 | $89+ |
| Render | ~$7 | $7–25 | $25+ |
| Vercel | Free | Free–$20 | $20 |
| MSG91 OTP | ~$2 | ~$15 | ~$60+ |
| Rate API (optional) | — | ₹800–2,000 | ₹2,000–4,000 |
| WA BSP (optional) | — | ₹1,000+ | ₹5,000+ |
| **Approx. total** | **~$9–12** | **~$30–70 + optional** | **~$190–200+ + optional** |

Most single-shop jewellers stay in **Starter** for a long time.

---

## What Client must keep funded

1. Render (API must stay up — cold starts on free tier are bad for customers).  
2. MSG91 wallet (OTP login fails if empty).  
3. Cloudinary (catalog images stop if over quota unpaid).  
4. Play Console account in good standing.

---

## Upgrade triggers (when costs jump)

| Signal | Likely upgrade |
|---|---|
| Slow DB / connection limits | Atlas M2+ |
| Image bandwidth warnings | Cloudinary paid |
| API CPU/memory limits | Render higher plan |
| Heavy OTP / marketing SMS misuse | Control OTP abuse; do not use OTP for promos |

---

**Client acknowledgement**

I understand running costs are separate from the build fee and billed by third parties to my accounts.

Name: _____________  Date: _____________  Sign: _____________
