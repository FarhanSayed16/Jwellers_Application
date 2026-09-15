# Phase 01 — Launch Module List (Ratnaraj)

**Status:** Recommended defaults prepared — **pending Client countersign**  
**Refs:** [04_FEATURES_AND_MODULES.md](../04_FEATURES_AND_MODULES.md) §11

Use this as the written launch scope until the formal quote is signed.

---

## Platforms

| Item | Decision |
|---|---|
| Android | ✅ Yes (v1) |
| iOS | ❌ Deferred unless separately paid |
| Play Console owner | **Client** (Ratnaraj) |
| Hosting / SMS / Cloudinary owner | **Client** |

---

## Feature flags at launch (recommended)

| Flag | ON/OFF | Rationale |
|---|---|---|
| `FEATURE_CHAT` | **ON** | Real Chat tab; core product |
| `FEATURE_WHATSAPP` | **ON** | Free deep links; high retailer value |
| `FEATURE_RATE_HISTORY` | **ON** | Trust; data already stored |
| `FEATURE_SIZE_GUIDE` | **ON** | Low cost; reduces size friction |
| `FEATURE_OFFERS` | **ON** | Banners/offers |
| `FEATURE_CUSTOM_REQUESTS` | **ON** | Custom jewellery requests |
| `FEATURE_HALLMARK` | **ON*** | *Confirm if they hallmark stock; else OFF |
| `FEATURE_DIGITAL_BILLING` | **OFF** | Upsell after go-live |
| `FEATURE_RAZORPAY_PAYMENTS` | **OFF** | Upsell |
| `FEATURE_RATE_API` | **OFF** | Manual rates first |
| `FEATURE_MULTI_BRANCH` | **OFF** | |
| `FEATURE_ANALYTICS` | **OFF** | |
| `FEATURE_WHATSAPP_BUSINESS_API` | **OFF** | |
| `FEATURE_OLD_GOLD_EXCHANGE` | **OFF** | Upsell |
| `FEATURE_ITEM_QR` | **OFF** | Showroom pack later |
| `FEATURE_OFFLINE_CATALOG` | **OFF** | |
| `FEATURE_I18N` | **OFF** | |

---

## Client confirmation

| Question | Client answer | Date |
|---|---|---|
| Accept recommended flags? | ☐ Yes ☐ Changes: _______ | |
| Hallmark module? | ☐ ON ☐ OFF | |
| Android-only OK? | ☐ Yes | |
| Client owns Play + infra accounts? | ☐ Yes | |

**Client name:** _________________  
**Sign / WhatsApp confirm link logged:** _________________  
**Provider:** _________________  

---

## After signature

1. Copy final ON/OFF into `clients/ratnaraj/modules.json`.  
2. Mirror into quote annex.  
3. Tick Phase 01.5 gate in master plan.
