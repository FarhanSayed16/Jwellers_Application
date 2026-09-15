# 03 — Data Model (Production)

**Source of truth for:** MongoDB collections, fields, indexes, statuses, soft-delete.  
**Stack:** Mongoose on a **single-client** database (no `tenant_id`).  
**Related:** [02_AUTH_AND_SECURITY](./02_AUTH_AND_SECURITY.md) · [04_FEATURES_AND_MODULES](./04_FEATURES_AND_MODULES.md)

---

## 1. Conventions

| Rule | Standard |
|---|---|
| IDs | MongoDB `ObjectId` (`_id`) |
| Timestamps | `createdAt`, `updatedAt` on every collection (`timestamps: true`) |
| Soft delete | `deletedAt: Date \| null` — default queries exclude soft-deleted |
| Money | Store rates/charges as `Number` in INR; document precision (paise optional later as integer) |
| Weight | Grams as `Number` with up to 3 decimal places |
| Enums | String enums in Mongoose; validate at API boundary |
| Audit | Critical writes (rates, admin user changes) include `createdBy` / `updatedBy` |

---

## 2. Collection overview

| Collection | Purpose |
|---|---|
| `shop_configs` | Branding, contacts, GST, theme tokens (singleton-style) |
| `admin_users` | Owner/staff accounts |
| `customers` | App users (phone identity) |
| `sessions` | Refresh-token / session revocation |
| `otp_challenges` | Hashed OTP challenges |
| `categories` | Category + subcategory tree |
| `items` | SKU catalog |
| `rates` | Dated gold/silver rates (history included) |
| `wishlists` | Per-customer saved items |
| `enquiries` | Structured enquiries |
| `custom_requests` | Custom design requests |
| `offers` | Banners / offers |
| `chat_threads` | Chat conversation headers |
| `chat_messages` | Chat messages |
| `devices` | FCM tokens |
| `media_assets` | Optional registry of uploaded assets |
| `invoices` | Digital bills (module) |
| `payments` | Razorpay payment records (module) |
| `old_gold_quotes` | Old-gold exchange estimates (module) |
| `appointments` | Store visit bookings (module) |
| `curated_boards` | Occasion/home boards (module) |
| `schemes` | Festival making-charge schemes (module) |
| `price_alerts` | Customer rate threshold alerts (module) |
| `wa_broadcasts` | WhatsApp Business broadcast log (module) |
| `feature_events` | Optional analytics events (views, wishlist) |
| `audit_logs` | Security/business audit trail |

---

## 3. Schemas

### 3.1 `shop_configs`

One active document per deployment (query latest / `isActive: true`).

```
shop_configs
├─ shopName: String, required
├─ logoUrl: String
├─ faviconUrl: String?
├─ contactPhone: String, required
├─ contactEmail: String?
├─ address: {
│    line1, line2?, city, state, pincode, country
│  }
├─ gstNumber: String?
├─ bisRegistrationNumber: String?          # when hallmark module relevant
├─ socialLinks: { instagram?, facebook?, youtube?, website?, whatsapp? }
├─ themeLight: {
│    primary, secondary, accent,
│    background, surface, textPrimary, textSecondary,
│    border, success, warning, error
│  }
├─ themeDark: { ...same keys as themeLight }
├─ makingChargeDefault: {
│    type: 'percent' | 'flat',
│    value: Number
│  }
├─ gstPercentDefault: Number               # e.g. 3
├─ currency: String                        # 'INR'
├─ timezone: String                        # 'Asia/Kolkata'
├─ isActive: Boolean, default true
├─ createdAt, updatedAt
```

**Indexes:** `{ isActive: 1 }`

---

### 3.2 `admin_users`

```
admin_users
├─ name: String, required
├─ email: String?, unique sparse
├─ phone: String?, unique sparse
├─ passwordHash: String, required
├─ role: 'owner' | 'staff', required
├─ permissions: [String]                   # optional fine-grained overrides
├─ isActive: Boolean, default true
├─ lastLoginAt: Date?
├─ failedLoginCount: Number, default 0
├─ lockUntil: Date?
├─ createdAt, updatedAt, deletedAt?
```

**Indexes:** `{ email: 1 }` unique sparse · `{ phone: 1 }` unique sparse · `{ role: 1, isActive: 1 }`

---

### 3.3 `customers`

```
customers
├─ phone: String, required, unique         # normalized
├─ name: String?
├─ isActive: Boolean, default true
├─ lastLoginAt: Date?
├─ createdAt, updatedAt, deletedAt?
```

Wishlist can be a separate collection (preferred for indexing) or `wishlistItemIds: [ObjectId]` — **prefer separate `wishlists`** below.

**Indexes:** `{ phone: 1 }` unique · `{ createdAt: -1 }`

---

### 3.4 `sessions`

```
sessions
├─ userType: 'customer' | 'admin'
├─ userId: ObjectId, required
├─ refreshTokenHash: String, required
├─ deviceInfo: String?
├─ expiresAt: Date, required
├─ revokedAt: Date?
├─ createdAt, updatedAt
```

**Indexes:** `{ userType: 1, userId: 1 }` · `{ expiresAt: 1 }` (TTL optional) · `{ refreshTokenHash: 1 }` unique

---

### 3.5 `otp_challenges`

```
otp_challenges
├─ phone: String, required
├─ otpHash: String, required
├─ expiresAt: Date, required
├─ attempts: Number, default 0
├─ consumedAt: Date?
├─ requestIp: String?
├─ createdAt, updatedAt
```

**Indexes:** `{ phone: 1, createdAt: -1 }` · `{ expiresAt: 1 }` TTL

---

### 3.6 `categories`

Supports `Category → Subcategory` (nullable parent). Deeper nesting allowed but UI targets 2 levels for MVP.

```
categories
├─ name: String, required
├─ slug: String, required
├─ coverImageUrl: String?
├─ parentId: ObjectId? → categories
├─ sortOrder: Number, default 0
├─ isActive: Boolean, default true
├─ createdAt, updatedAt, deletedAt?
```

**Indexes:** `{ parentId: 1, sortOrder: 1 }` · `{ slug: 1 }` unique · `{ isActive: 1, parentId: 1 }`

---

### 3.7 `items`

```
items
├─ sku: String, required, unique
├─ title: String, required
├─ description: String?
├─ categoryId: ObjectId → categories, required
├─ subcategoryId: ObjectId → categories?
├─ images: [{
│    url: String,
│    publicId: String?,
│    sortOrder: Number,
│    isPrimary: Boolean
│  }]
├─ metal: 'gold' | 'silver' | 'other'
├─ purity: '24K' | '22K' | '18K' | 'other' | null
├─ huid: String?                           # FEATURE_HALLMARK
├─ hallmarkImageUrl: String?
├─ grossWeightGrams: Number?
├─ netWeightGrams: Number?
├─ makingCharge: {
│    type: 'percent' | 'flat' | 'inherit', # inherit = shop default
│    value: Number?
│  }
├─ stoneDetails: String?
├─ sizeInfo: String?                       # free text; size-guide is UI-side
├─ tags: [String]
├─ isNewArrival: Boolean, default false
├─ isFeatured: Boolean, default false
├─ status: 'draft' | 'active' | 'sold' | 'archived'
├─ viewCount: Number, default 0            # analytics hook
├─ wishlistCount: Number, default 0
├─ createdBy: ObjectId → admin_users?
├─ updatedBy: ObjectId → admin_users?
├─ createdAt, updatedAt, deletedAt?
```

**Indexes:**

- `{ sku: 1 }` unique  
- `{ categoryId: 1, subcategoryId: 1, status: 1 }`  
- `{ status: 1, isNewArrival: 1, updatedAt: -1 }`  
- `{ status: 1, isFeatured: 1 }`  
- `{ tags: 1 }`  
- Text index optional: `{ title: 'text', sku: 'text', tags: 'text' }`

---

### 3.8 `rates` (includes history)

Every admin save inserts a **new** document (append-only history). “Latest” = newest by `effectiveAt`.

```
rates
├─ effectiveAt: Date, required             # when rate became active
├─ gold24kPerGram: Number, required
├─ gold22kPerGram: Number, required
├─ gold18kPerGram: Number, required
├─ silverPerGram: Number, required
├─ note: String?
├─ source: 'manual' | 'api'
├─ createdBy: ObjectId → admin_users?
├─ createdAt, updatedAt
```

**Indexes:** `{ effectiveAt: -1 }` · `{ createdAt: -1 }`

Rate History screen = query last N days ordered by `effectiveAt`.

---

### 3.9 `wishlists`

```
wishlists
├─ customerId: ObjectId → customers, required
├─ itemId: ObjectId → items, required
├─ createdAt, updatedAt
```

**Indexes:** `{ customerId: 1, itemId: 1 }` unique · `{ itemId: 1 }`

---

### 3.10 `enquiries`

```
enquiries
├─ customerId: ObjectId → customers, required
├─ itemId: ObjectId → items?
├─ message: String, required
├─ status: 'new' | 'in_progress' | 'closed' | 'converted'
├─ assignedTo: ObjectId → admin_users?
├─ channel: 'app' | 'whatsapp_deeplink'
├─ createdAt, updatedAt, deletedAt?
```

**Indexes:** `{ status: 1, createdAt: -1 }` · `{ customerId: 1, createdAt: -1 }` · `{ itemId: 1 }`

---

### 3.11 `custom_requests`

```
custom_requests
├─ customerId: ObjectId → customers, required
├─ description: String, required
├─ referenceImageUrls: [String]
├─ budgetHint: String?
├─ status: 'new' | 'in_progress' | 'quoted' | 'closed'
├─ createdAt, updatedAt, deletedAt?
```

**Indexes:** `{ status: 1, createdAt: -1 }` · `{ customerId: 1 }`

---

### 3.12 `offers`

```
offers
├─ title: String, required
├─ description: String?
├─ bannerImageUrl: String?
├─ validFrom: Date?
├─ validTill: Date?
├─ isActive: Boolean, default true
├─ sortOrder: Number, default 0
├─ createdAt, updatedAt, deletedAt?
```

**Indexes:** `{ isActive: 1, validFrom: 1, validTill: 1 }`

---

### 3.13 `chat_threads` & `chat_messages`

Used when `FEATURE_CHAT=true`.

```
chat_threads
├─ customerId: ObjectId → customers, required
├─ subject: String?                        # e.g. item SKU / "General"
├─ itemId: ObjectId → items?
├─ status: 'open' | 'pending_customer' | 'pending_staff' | 'closed'
├─ lastMessageAt: Date?
├─ lastMessagePreview: String?
├─ unreadCustomer: Number, default 0
├─ unreadStaff: Number, default 0
├─ createdAt, updatedAt, deletedAt?

chat_messages
├─ threadId: ObjectId → chat_threads, required
├─ senderType: 'customer' | 'staff'
├─ senderId: ObjectId, required            # customer or admin_users
├─ body: String?
├─ attachmentUrls: [String]
├─ clientMessageId: String?                # idempotency from app
├─ sentAt: Date, default now
├─ readAt: Date?
├─ deletedAt: Date?
├─ createdAt, updatedAt
```

**Indexes:**

- threads: `{ customerId: 1, lastMessageAt: -1 }` · `{ status: 1, lastMessageAt: -1 }`  
- messages: `{ threadId: 1, sentAt: 1 }` · `{ threadId: 1, clientMessageId: 1 }` unique sparse  

**Transport for MVP chat:** REST poll or short polling + FCM “new message” nudge.  
**Upgrade path:** Socket.IO / WebSocket on same models without schema rewrite ([07](./07_FUTURE_AND_UPSCALING.md)).

---

### 3.14 `devices`

```
devices
├─ customerId: ObjectId → customers, required
├─ fcmToken: String, required
├─ platform: 'android' | 'ios'
├─ isActive: Boolean, default true
├─ lastSeenAt: Date?
├─ createdAt, updatedAt
```

**Indexes:** `{ fcmToken: 1 }` unique · `{ customerId: 1, isActive: 1 }`

---

### 3.15 `invoices` (FEATURE_DIGITAL_BILLING)

```
invoices
├─ invoiceNumber: String, unique
├─ customerId: ObjectId → customers?
├─ enquiryId: ObjectId → enquiries?
├─ itemId: ObjectId → items?
├─ lineItems: [{
│    description, sku?, purity?, weightGrams?,
│    ratePerGram?, makingChargeAmount?, gstAmount?, lineTotal
│  }]
├─ subtotal: Number
├─ gstTotal: Number
├─ grandTotal: Number
├─ rateSnapshot: { gold24k, gold22k, gold18k, silver, effectiveAt }
├─ pdfUrl: String?
├─ status: 'draft' | 'issued' | 'cancelled'
├─ issuedAt: Date?
├─ createdBy: ObjectId → admin_users?
├─ createdAt, updatedAt
```

**Indexes:** `{ invoiceNumber: 1 }` unique · `{ customerId: 1, issuedAt: -1 }`

---

### 3.16 `payments` (FEATURE_RAZORPAY_PAYMENTS)

```
payments
├─ customerId: ObjectId → customers?
├─ enquiryId: ObjectId → enquiries?
├─ invoiceId: ObjectId → invoices?
├─ razorpayOrderId: String, unique
├─ razorpayPaymentId: String?
├─ amountInPaise: Number, required
├─ currency: String, default 'INR'
├─ status: 'created' | 'paid' | 'failed' | 'refunded'
├─ rawWebhook: Mixed?                      # store carefully; redact if needed
├─ createdAt, updatedAt
```

**Indexes:** `{ razorpayOrderId: 1 }` unique · `{ status: 1, createdAt: -1 }`

---

### 3.17 `feature_events` (analytics hook)

```
feature_events
├─ type: 'item_view' | 'wishlist_add' | 'enquiry_create' | 'calculator_use'
├─ customerId: ObjectId?
├─ itemId: ObjectId?
├─ meta: Mixed?
├─ createdAt
```

**Indexes:** `{ type: 1, createdAt: -1 }` · `{ itemId: 1, type: 1 }`

Ship write path early even if admin charts wait until Phase 3.

---

### 3.18 `audit_logs`

```
audit_logs
├─ actorType: 'admin' | 'system'
├─ actorId: ObjectId?
├─ action: String                          # e.g. 'rate.create', 'item.update'
├─ entityType: String?
├─ entityId: ObjectId?
├─ before: Mixed?
├─ after: Mixed?
├─ ip: String?
├─ createdAt
```

**Indexes:** `{ createdAt: -1 }` · `{ action: 1, createdAt: -1 }`

---

## 4. Calculator (no dedicated collection)

Price is computed server-side or client-side from:

1. Latest `rates` row  
2. Item weights + purity **or** user-entered weight/purity on Calculator screen  
3. Making charge (`item.makingCharge` or shop default)  
4. GST %  

Formula (document in API):

```
metalValue = weightGrams × ratePerGramForPurity
making    = making.type === 'percent' ? metalValue × (value/100) : value
taxable   = metalValue + making (+ stones if ever added)
gst       = taxable × (gstPercent/100)
total     = taxable + gst
```

Old-gold exchange calculator (module/USP) uses deduction % from `shop_configs` extension fields when enabled — add `exchangeDeductionPercent` when that module is sold.

---

## 5. Size guide

Static content (charts) can live:

- In app assets, **or**
- In `shop_configs.sizeGuides` JSON blob for per-client customization later  

No transactional collection required for MVP.

---

## 6. Migration / seed expectations

Per new client database:

1. Seed `shop_configs` from branding form  
2. Seed first `admin_users` owner  
3. Optional sample categories for training  
4. No shared data copy from other clients  

Schema changes ship via versioned migration scripts (migrate-mongo or custom) applied **per client** during AMC upgrades.

---

## 7. What this model deliberately excludes

- `tenant_id` / shared multi-tenant collections  
- Cart / full e-commerce checkout as default (payments module is advance/booking oriented)  
- International multi-currency as default  

Those stay out unless a paid custom engagement requires them.
