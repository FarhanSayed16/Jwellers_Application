# 13 — End-to-End Flows (Auth, Catalog, Chat, Ops)

**Source of truth for:** step-by-step flows across **mobile · admin · API** so implementation stays aligned.  
**Related:** [02](./02_AUTH_AND_SECURITY.md) · [09](./09_BACKEND_API.md) · [10](./10_ADMIN_WEB_PAGES.md) · [11](./11_MOBILE_APP_SCREENS.md)

---

## 1. How to use

Each flow lists: **Actors → Steps → APIs → UI → Failure cases → Done when**.  
Implement backend + both clients against these, not against memory.

---

## 2. Customer OTP login

### Actors
Customer (Flutter), API, MSG91

### Steps

1. User opens `/auth/phone` (or soft-gate sheet).  
2. Enters 10-digit mobile → Send OTP.  
3. App `POST /api/v1/auth/customer/otp/request` `{ phone }`.  
4. API validates phone, rate-limits, stores otpHash, SMS via MSG91.  
5. App navigates `/auth/otp` with cooldown timer.  
6. User enters OTP → `POST /auth/customer/otp/verify`.  
7. API upserts `customers`, creates `sessions`, returns tokens + profile.  
8. App saves tokens in secure storage; `POST /devices` with FCM token.  
9. Navigate to `returnTo` or `/home`.

### Failures

| Case | UI |
|---|---|
| Invalid phone | Inline error |
| 429 rate limit | Show wait minutes |
| Wrong OTP | Attempts left / lock |
| SMS failure | Generic retry; do not expose vendor errors |

### Done when
Guest becomes authenticated; protected routes work; refresh survives app restart.

---

## 3. Customer token refresh

1. API returns 401 on protected call.  
2. Dio interceptor `POST /auth/customer/token/refresh` with refresh token.  
3. On success: retry original request.  
4. On failure: clear storage → auth gate / login.

Admin mirror: [Flow 4](#4-admin-login).

---

## 4. Admin login

### Actors
Owner/Staff (Next.js), API

### Steps

1. Open `/login`.  
2. Submit emailOrPhone + password → `POST /auth/admin/login`.  
3. Store access (memory) + refresh (httpOnly cookie preferred).  
4. `GET /auth/admin/me` + `GET /config/features` + `GET /admin/shop-config`.  
5. Redirect `/` dashboard; build sidebar from role + flags.

### Failures

| Case | UI |
|---|---|
| Bad credentials | Generic error |
| Locked account | “Try later” |
| Network | Retry |

### Done when
Owner reaches dashboard; staff never sees branding/staff nav.

---

## 5. Set today’s rate → customer sees update

### Steps

1. Admin `/rates` enters 24K/22K/18K/silver → Save.  
2. `POST /rates` inserts new document (`source: manual`).  
3. Optional Notify → `POST /rates/notify` → FCM `rates_updated`.  
4. Mobile Home: pull-to-refresh or FCM handler → `GET /rates/latest`.  
5. Calculator reads same latest rates.  
6. Rate history gains a point (`GET /rates/history`).

### Done when
New rate visible on device without app store release; history length +1.

---

## 6. Add catalog item → browse on mobile

### Steps

1. Admin creates categories/subcategories.  
2. Admin `/catalog/items/new`: fills form; images via `POST /media/sign` → Cloudinary → save URLs.  
3. `POST /items` with `status: active`, optional `isNewArrival`.  
4. Mobile Collection → subcategory → grid `GET /items?subcategoryId=&status=active`.  
5. Detail `GET /items/:id` (viewCount++ optional).  
6. Home New Arrivals includes item if flagged.

### Failures

| Case | Handling |
|---|---|
| Duplicate SKU | 409 → admin toast |
| Upload fail | Keep form data; retry image |
| Soft-deleted | Hidden from public GETs |

### Done when
Item appears on mobile within refresh; images load with placeholder fallback.

---

## 7. Wishlist

1. User taps heart on grid/detail.  
2. If guest → auth Flow 2 with `returnTo`.  
3. `POST /wishlist` `{ itemId }` or DELETE toggle.  
4. Account → Wishlist lists `GET /wishlist`.

### Done when
Persist across reinstall only if same account; heart state syncs on detail open.

---

## 8. Enquire about item

1. Item detail → Enquire.  
2. Auth if needed.  
3. Optional message sheet → `POST /enquiries` `{ itemId, message, channel: 'app' }`.  
4. Admin `/enquiries` shows **new**.  
5. Admin updates status `PATCH /admin/enquiries/:id`.  
6. Customer `/enquiries` sees status.

**WhatsApp variant:** CTA opens `wa.me/<retailer>?text=` prefilled SKU + link; may also log enquiry with `channel: 'whatsapp_deeplink'` if you choose to record it.

### Done when
Retailer can act without checking personal WhatsApp only (app inbox works).

---

## 9. Chat (Phase A)

### Start from item

1. Detail → Chat about item (requires auth + FEATURE_CHAT).  
2. `POST /chat/threads` `{ itemId }` (reuse open thread if exists — API idempotent by customer+item).  
3. Open `/chat/:threadId`.  
4. Customer sends `POST .../messages` with `clientMessageId`.  
5. API updates thread preview/unreadStaff.  
6. FCM to staff devices optional; admin polls inbox.  
7. Staff replies in admin Chat; unreadCustomer++; FCM to customer.  
8. Both sides `POST .../read` clears badges.

### Failures

| Case | Handling |
|---|---|
| Feature off | CTA hidden |
| Not participant | 403 |
| Duplicate clientMessageId | Return existing message |

### Done when
Two-way thread works on Demo; unread badges correct; no cross-customer leaks.

---

## 10. Custom request

1. Account → Custom Requests → New.  
2. Upload reference images (customer-signed media).  
3. `POST /custom-requests`.  
4. Admin list → status workflow.

### Done when
Images visible to admin; customer sees status changes.

---

## 11. Push notification registration

1. After login (and permission granted), `POST /devices`.  
2. On logout, `DELETE /devices/:token` + local disable.  
3. Admin notify endpoints fan out only `isActive` tokens.

### Done when
Rate notify reaches a test device; logged-out device stops receiving (or receives no personal chat).

---

## 12. Account deletion (Play compliance)

1. Account → Delete account → confirm.  
2. `DELETE /auth/customer/me`.  
3. API: soft-delete/anonymize customer; revoke sessions; deactivate devices; keep invoices if legally required (documented).  
4. App clears storage → `/home` guest.

### Done when
Same phone can OTP again as **new** customer record policy (document: reuse phone creates fresh profile vs block — **recommend allow fresh profile**).

---

## 13. Branding change without rebuild

1. Owner `/branding` updates tokens + logo → `PATCH /admin/shop-config`.  
2. Mobile on next cold start / pull config refresh applies ThemeData.  
3. Flavor icons/name still require store build (document for client).

### Done when
Primary color change visible in app after refresh; Play icon unchanged until new AAB.

---

## 14. New client spin-up (ops flow)

1. Create `clients/<slug>` flavor + branding tokens.  
2. Provision Atlas, Render, Vercel, Cloudinary, MSG91, Firebase.  
3. Set env flags per sold modules.  
4. `seedOwner` script.  
5. Deploy API + admin; Codemagic AAB.  
6. Smoke: Flows 4 → 5 → 6 → 2 → 8 → 9.  
7. Legal URLs + Play listing ([06](./06_LEGAL_AND_COMPLIANCE.md)).  
8. Train retailer on Rates + Items + Chat/Enquiries.

### Done when
Checklist in [01](./01_PRODUCT_AND_ARCHITECTURE.md) §7 complete.

---

## 15. Feature-flag runtime flow

1. App/Admin boot → `GET /config/features`.  
2. UI builds nav from flags.  
3. API mutators also `requireFeature`.  
4. Changing flag = env + redeploy API (+ clients pick up on next config fetch).

**Never** trust client-only hiding for security.

---

## 16. Calculator quote consistency

1. Mobile may compute locally using `/rates/latest` + rules.  
2. Preferred: `POST /calculator/quote` for identical breakup.  
3. Item detail estimate uses item weight/purity + same formula ([03](./03_DATA_MODEL.md) §4).

### Done when
Detail estimate and Calculator match for same inputs (± rounding paise policy documented — recommend round to nearest ₹1 for display).

---

## 17. Flow ownership matrix

| Flow | Primary builder first | Needs |
|---|---|---|
| 2–3 Auth customer | Mobile + API | MSG91 |
| 4 Admin auth | Admin + API | seed owner |
| 5 Rates | Admin + API + Mobile | FCM later |
| 6 Catalog | Admin + API + Mobile | Cloudinary |
| 9 Chat | All three | FEATURE_CHAT |
| 12 Delete | Mobile + API | Play policy |

---

## 18. Integration test script (Demo)

Run before any client production promote:

1. Admin login  
2. Set rate + notify  
3. Create category/sub/item + 2 images  
4. Mobile: see rate + item  
5. OTP login test number  
6. Wishlist + enquire  
7. Chat both directions  
8. Logout + delete account on disposable user  
9. Confirm staff cannot open branding (second user)

Sign-off on [05](./05_BUILD_ROADMAP.md) Definition of Done.
