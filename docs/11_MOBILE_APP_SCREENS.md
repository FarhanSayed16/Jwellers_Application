# 11 — Mobile App (Flutter) Screens & Navigation

**Source of truth for:** Flutter screens, nav graph, Riverpod responsibilities, screen UI specs.  
**Stack:** Flutter · Riverpod · flavors · secure storage · FCM  
**Related:** [09](./09_BACKEND_API.md) · [12](./12_DESIGN_SYSTEM.md) · [13](./13_END_TO_END_FLOWS.md)

---

## 1. Goals

- Customer-facing white-label jewellery app.  
- Branding from flavor + `/config/public`.  
- Modules from `/config/features` (hide Chat tab if off).  
- Offline-tolerant UI (skeletons, errors with retry); full offline catalog is a later flag.

---

## 2. Project structure

```
apps/mobile/
  lib/
    main.dart
    main_demo.dart / main_ratnaraj.dart   # flavor entrypoints
    app.dart
    core/
      theme/           # tokens → ThemeData
      network/         # Dio client, interceptors
      storage/         # secure storage
      router/          # go_router
      config/          # public config + features providers
    features/
      home/
      collection/
      item/
      calculator/
      auth/
      account/
      wishlist/
      enquiry/
      chat/
      rates/
      size_guide/
      offers/
    shared/widgets/
  assets/
  android/ios flavor configs
```

**Routing:** `go_router` (recommended).  
**State:** Riverpod (`Provider` / `AsyncNotifier`).

---

## 3. Navigation graph

### 3.1 Bottom tabs (Shell)

| Tab | Route | Visible when |
|---|---|---|
| Home | `/home` | always |
| Collection | `/collection` | always |
| Calculator | `/calculator` | always |
| Chat | `/chat` | `FEATURE_CHAT == true` |

If chat off → 3 tabs only. **Never** show empty Chat tab.

### 3.2 Full route map

| Route | Screen | Auth |
|---|---|---|
| `/splash` | Splash / bootstrap | — |
| `/home` | Home | optional |
| `/collection` | Top categories | optional |
| `/collection/:categoryId` | Subcategories | optional |
| `/collection/:categoryId/:subId` | Item grid | optional |
| `/items/:id` | Item detail | optional |
| `/items/sku/:sku` | Item by SKU (QR/deep link) | optional |
| `/calculator` | Price calculator | optional |
| `/rates/history` | Rate history | optional |
| `/size-guide` | Size guide | if SIZE_GUIDE |
| `/search` | Search | optional |
| `/auth/phone` | Enter phone | guest |
| `/auth/otp` | Enter OTP | guest |
| `/account` | Account hub | optional (gated actions) |
| `/wishlist` | Wishlist | required |
| `/enquiries` | My enquiries | required |
| `/custom-requests` | Custom requests | required + flag |
| `/custom-requests/new` | New request form | required + flag |
| `/offers` | Offers list | flag |
| `/about` | About retailer | optional |
| `/chat` | Thread list | required + CHAT |
| `/chat/:threadId` | Conversation | required + CHAT |
| `/settings/theme` | Theme mode | optional |
| `/legal/privacy` | Privacy | optional |
| `/account/delete` | Delete account | required |

**Auth gate:** Soft gate — browsing public; wishlist/chat/enquire prompt login then return to intended route.

---

## 4. Bootstrap sequence (Splash)

```
1. Load flavor constants (API_BASE_URL, app name)
2. GET /config/public + /config/features  (cache locally)
3. Apply ThemeData from tokens
4. Restore tokens from secure storage; if refresh valid, silent refresh
5. Init FCM permission flow (defer ask until after priming screen ideally)
6. Navigate to /home
```

Failure of config → retry UI (cannot run unbranded blindly in production).

---

## 5. Screen specifications

### 5.1 Home `/home`

| Zone | Content |
|---|---|
| App bar | Logo + shop name; call icon (`tel:`); notification bell (opens system settings or in-app notification center later) |
| Hero | Banner image/video placeholder (image MVP; video Phase 3) |
| Search | Taps to `/search` |
| Rates | Gold/Silver toggle; cards 24K/22K/18K or silver; timestamp; “Live” = latest manual rate; link to history |
| Rows | New Arrivals horizontal; Featured; category previews |
| Pull to refresh | Reload rates + home sections |

**States:** skeleton on load; error banner with Retry.

---

### 5.2 Collection `/collection`

- Grid of top-level categories (cover + name)  
- Tap → subcategories or items if no children  

---

### 5.3 Subcategory grid

- Same card pattern  
- Tap → item grid  

---

### 5.4 Item grid

| Element | Behavior |
|---|---|
| Card | Primary image, SKU or short title, wishlist heart |
| Heart | Requires auth; optimistic toggle |
| App bar | Filter + search icons |
| Filter sheet | purity, metal, sort |

---

### 5.5 Item detail `/items/:id`

| Section | Content |
|---|---|
| Gallery | PageView images; watermark OK as delivered by CDN |
| Title / SKU | |
| Metal / purity / weights | |
| Hallmark badge | if flag + huid present |
| Price breakup | Using latest rates + item making (or “Enquire for price” policy if weight missing — decide per client; default show estimate when weight present) |
| CTAs | Enquire · Chat about item (if CHAT) · WhatsApp (if WHATSAPP) |
| Size guide link | if relevant category |

---

### 5.6 Calculator `/calculator`

| Field | Notes |
|---|---|
| Today’s rate card | From `/rates/latest` + Live badge + date |
| Purity chips | 24K / 22K / 18K |
| Weight | grams, 3 decimal |
| Making % | default from config; editable |
| GST % | default 3; editable |
| Result | Metal + making + GST + total |
| Actions | Reset · Share (later share card) · WhatsApp share text if flag |

Optionally call `POST /calculator/quote` for single source of truth.

---

### 5.7 Rate history `/rates/history`

- Chart (fl_chart or similar) + list of dated rates  
- Gold purity selector for series  

---

### 5.8 Size guide `/size-guide`

- Tabs: Ring / Bangle / Necklace  
- Static charts + simple estimator inputs → nearest size  
- Pure client-side unless config overrides charts  

---

### 5.9 Auth — phone `/auth/phone`

- Title: Login  
- Phone field (+91 prefix UI)  
- CTA: Send OTP  
- Terms/privacy microcopy  
- Errors: invalid phone, rate limited countdown  

---

### 5.10 Auth — OTP `/auth/otp`

- 6-digit input (auto-focus; SMS autofill if available)  
- Resend with cooldown timer  
- Verify → store tokens → register FCM device → pop to `returnTo`  

---

### 5.11 Account `/account`

| Row | Gate |
|---|---|
| Name + phone | logged in; guest sees Login CTA |
| My Wishlist | auth |
| My Enquiries | auth |
| Custom Requests | auth + flag |
| Offers | flag |
| Rate History | |
| Size Guide | flag |
| About Retailer | |
| Theme (System/Light/Dark) | |
| Privacy | |
| Delete account | auth |
| Log out | auth |

---

### 5.12 Wishlist / Enquiries / Custom requests

- Standard list + empty states  
- Custom request form: description, images (signed upload as customer — API must allow C on `/media/sign` for this use), budget optional  

---

### 5.13 Chat list & thread

**List:** preview, time, unread badge.  
**Thread:** bubbles (customer right / staff left), image attachments, composer, send idempotent `clientMessageId`.  
**Entry points:** tab · item detail “Chat” · optionally enquiry conversion later.

On new FCM chat message → invalidate thread provider.

---

### 5.14 About / Legal / Delete

- About: address, phone, GST, social links, map link optional  
- Delete: typed confirm + API delete + clear storage → guest home  

---

## 6. Global UX patterns

| Pattern | Rule |
|---|---|
| Loading | Shimmer skeletons matching layout |
| Error | Inline + Retry; no silent fail |
| Auth intercept | Bottom sheet “Login to continue” → phone → return |
| Images | `cached_network_image`; placeholder; error asset |
| Haptics | Light on wishlist / successful calculate |
| Typography / colors | Only via theme tokens ([12](./12_DESIGN_SYSTEM.md)) |

---

## 7. Riverpod provider map (minimum)

| Provider | Role |
|---|---|
| `publicConfigProvider` | shop + themes |
| `featuresProvider` | flags |
| `authProvider` | tokens + customer profile |
| `latestRatesProvider` | rates |
| `homeFeedProvider` | new/featured/categories |
| `itemDetailProvider(id)` | item |
| `wishlistProvider` | ids + items |
| `chatThreadsProvider` | list |
| `chatMessagesProvider(threadId)` | messages |
| `themeModeProvider` | system/light/dark |

---

## 8. Networking

- Dio + interceptors: attach access token; on 401 refresh queue; `X-Request-Id` optional  
- Timeouts: connect 15s, receive 30s  
- Pretty error mapping from `error.code`  

---

## 9. Push (FCM)

| Event | App behavior |
|---|---|
| `rates_updated` | Refresh rates; optional local notification |
| `new_arrival` | Optional deep link to item/collection |
| `chat_message` | Badge + refresh thread if open |

Payload: opaque ids only; fetch content via API.

---

## 10. Flavors

| Flavor | applicationId example | API |
|---|---|---|
| `demo` | `com.yourco.demojewellers` | demo API |
| `ratnaraj` | `com.ratnaraj.jewellers` | Ratnaraj API |

Each: app name, icons, splash, Firebase config if needed, `API_BASE_URL`.

---

## 11. Mobile implementation order

1. Flavor + theme + router + Dio + splash/config  
2. Home + rates + collection + item detail  
3. Calculator + rate history + size guide  
4. Auth OTP + account + wishlist  
5. Enquire + WhatsApp  
6. Chat  
7. FCM  
8. Delete account + polish  

---

## 12. Acceptance criteria (mobile)

- [ ] Brand tokens change UI without hardcoded colors in widgets  
- [ ] Chat tab hidden when flag false  
- [ ] Guest can browse and calculate; login required for wishlist/chat/enquire  
- [ ] OTP cooldown & errors match API  
- [ ] Deep link `/items/sku/XXX` opens detail  
- [ ] Works on mid-range Android; light + dark verified on jewellery photos  
