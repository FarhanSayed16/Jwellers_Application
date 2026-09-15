# 10 — Admin Web (Next.js) Pages & UI Plan

**Source of truth for:** admin routes, page layouts, components, auth wiring, state.  
**Stack:** Next.js App Router · TypeScript · Tailwind · design tokens from shop config  
**Related:** [09](./09_BACKEND_API.md) · [12](./12_DESIGN_SYSTEM.md) · [13](./13_END_TO_END_FLOWS.md)

---

## 1. Purpose

Desktop-first control panel for the jeweller: rates, catalog, enquiries, chat, branding, optional modules.  
Hosted on **Vercel Hobby** per client; `NEXT_PUBLIC_API_BASE_URL` points at that client’s Render API.

---

## 2. App structure

```
apps/admin/
  app/
    (auth)/
      login/page.tsx
      forgot-password/page.tsx
      reset-password/page.tsx
    (app)/                    # authenticated shell
      layout.tsx              # sidebar + topbar
      page.tsx                # dashboard
      rates/page.tsx
      catalog/
        categories/page.tsx
        items/page.tsx
        items/new/page.tsx
        items/[id]/page.tsx
      enquiries/page.tsx
      enquiries/[id]/page.tsx
      custom-requests/page.tsx
      chat/page.tsx
      chat/[threadId]/page.tsx
      offers/page.tsx
      branding/page.tsx
      staff/page.tsx
      invoices/page.tsx         # if feature
      payments/page.tsx         # if feature
      old-gold/page.tsx         # if feature
      appointments/page.tsx     # if feature
      boards/page.tsx           # if feature
      analytics/page.tsx        # if feature
      crm/page.tsx              # if feature
      schemes/page.tsx          # if feature
      referrals/page.tsx        # if feature
      price-alerts/page.tsx     # if feature
      settings/page.tsx
    layout.tsx
    globals.css
  components/
    ui/                       # buttons, inputs, tables, dialogs
    layout/Sidebar.tsx
    layout/Topbar.tsx
    catalog/ItemForm.tsx
    rates/RateForm.tsx        # + Rate API fetch/publish + WA broadcast (premium)
    chat/ThreadList.tsx
    chat/MessagePane.tsx
  lib/
    api.ts                    # fetch wrapper + refresh
    auth.ts
    features.ts               # from /config/features
    format.ts
  middleware.ts               # protect (app) routes
```

---

## 3. Auth (admin UI)

| Concern | Plan |
|---|---|
| Login page | Email/phone + password → `POST /auth/admin/login` |
| Token storage | Access token in memory (React context); refresh token in **httpOnly cookie** set by API **or** both in memory for MVP with `localStorage` refresh **only if** documented risk accepted. Prefer httpOnly refresh. |
| Middleware | Redirect unauthenticated users to `/login` |
| On 401 | Try refresh once → retry; else logout |
| First owner | Created by seed script; login page shows no “sign up” |

### Login page UI

- Shop logo (from `/config/public` if available without auth, else static)  
- Title: “Retailer Admin”  
- Fields: Email or phone, Password  
- CTA: Sign in  
- Link: Forgot password  
- Errors inline (invalid credentials, locked account)

### Post-login

Redirect to `/` dashboard.

---

## 4. Shell layout

```
┌────────────┬──────────────────────────────────────┐
│  Logo      │  Page title              [User] [⎋]  │
│  Nav       ├──────────────────────────────────────┤
│  • Dash    │                                      │
│  • Rates   │           Page content               │
│  • Catalog │                                      │
│  • Enquiry │                                      │
│  • Chat    │                                      │
│  • Offers* │                                      │
│  • Brand*  │                                      │
│  • Staff*  │                                      │
│  • Invoices* / Payments* / Old-gold*              │
│  • Appointments* / Boards* / Analytics* / CRM*    │
│  • Schemes* / Referrals* / Price alerts*          │
│  • Settings│                                      │
└────────────┴──────────────────────────────────────┘
```

`*` = owner-only or feature-flag gated. Hide nav items when flag is false. Rates page also hosts Rate API + WA Business broadcast actions when premium flags are on.

**Mobile admin:** usable but not primary; collapse sidebar to drawer &lt; 768px.

---

## 5. Page-by-page specification

### 5.1 Dashboard `/`

| Block | Data | Actions |
|---|---|---|
| Today’s rates card | `GET /rates/latest` | Link to Rates |
| Stats row | `GET /admin/dashboard` | Items active, enquiries new, chats open, wishlists (if avail) |
| Needs attention | New enquiries + unread chats | Deep links |
| Quick actions | Set today’s rate, Add item, Open chat | Buttons |

**Empty state:** If no rate today → prominent “Set today’s rate” CTA.

---

### 5.2 Rates `/rates`

| UI | Behavior |
|---|---|
| Form | 24K / 22K / 18K / Silver inputs (₹ per gram) |
| Preview | Shows timestamp after save |
| Save | `POST /rates` → success toast |
| Notify toggle | Checkbox “Notify app customers” → `POST /rates/notify` |
| History table | `GET /rates/history` paginated |

**Validation:** all numbers &gt; 0; confirm dialog if change &gt; 8% vs previous (reduce mistakes).

---

### 5.3 Categories `/catalog/categories`

- Tree or two-level list (parent → children)  
- Add / rename / cover image / sort order / soft delete  
- Cover upload via signed Cloudinary  

---

### 5.4 Items list `/catalog/items`

| Element | Detail |
|---|---|
| Filters | category, subcategory, status, search q |
| Table/grid toggle | Table default: SKU, thumb, title, purity, weight, status, featured/new |
| Actions | Edit, Clone (later), Archive, Restore |
| Primary CTA | Add item |

---

### 5.5 Item create/edit `/catalog/items/new` · `/catalog/items/[id]`

**Form sections (single scroll page):**

1. **Basics** — title, SKU, category, subcategory, status  
2. **Metal** — metal, purity, HUID + hallmark image (if `FEATURE_HALLMARK`)  
3. **Weight** — gross / net grams  
4. **Making** — inherit / percent / flat  
5. **Media** — multi-image upload, set primary, reorder  
6. **Merchandising** — tags, new arrival, featured, description, stone details, size info  
7. **Actions** — Save, Save & add another, Delete  

**Image guidance banner:** min ~1500×1500, plain background, multiple angles.

---

### 5.6 Enquiries `/enquiries` · `/enquiries/[id]`

- List: status tabs (New / In progress / Closed)  
- Detail: customer phone/name, item link, message, status select, assign staff, optional “Open chat” if chat exists  

---

### 5.7 Custom requests `/custom-requests`

Same pattern as enquiries; show reference images lightbox.

---

### 5.8 Chat `/chat` · `/chat/[threadId]`

```
┌─────────────┬────────────────────────────┐
│ Thread list │ Customer name · item SKU   │
│ search      │ messages (scroll)          │
│ unread dot  │ composer: text + attach    │
└─────────────┴────────────────────────────┘
```

- Poll every 5–10s **or** refresh on focus; later Socket.IO  
- Status controls: open / pending / closed  
- Canned replies dropdown (Month 5+)  

Hide entire nav entry if `FEATURE_CHAT=false`.

---

### 5.9 Offers `/offers` (flag)

- List cards: title, validity, active toggle  
- Form: title, description, banner, validFrom/Till  

---

### 5.10 Branding `/branding` (owner)

| Section | Fields |
|---|---|
| Identity | shop name, logo upload, contact, address, GST, BIS no. |
| Theme light | color token pickers |
| Theme dark | color token pickers |
| Defaults | making charge default, GST % |
| Social | Instagram, WhatsApp number, etc. |
| Preview | Mini phone mock using tokens |

Save → `PATCH /admin/shop-config`. Warn: “Customers see this after refresh; app build not required for colors if remote config used.”

---

### 5.11 Staff `/staff` (owner)

- List admins  
- Invite: name, phone/email, role staff, temporary password or invite link  
- Deactivate  

---

### 5.12 Invoices / Payments (flags)

- Invoices: create from enquiry/item, download PDF, share link  
- Payments: list statuses, link to Razorpay dashboard help text  

---

### 5.13 Settings `/settings`

- Profile / change password  
- Feature modules **read-only** list (“Chat: ON — contact support to change”)  
- Links to privacy policy, support WhatsApp  
- Logout  

---

## 6. Shared UI components

| Component | Use |
|---|---|
| `PageHeader` | title + primary action |
| `DataTable` | sortable columns, row actions |
| `StatusBadge` | enquiry/chat/item status colors |
| `ConfirmDialog` | destructive actions |
| `ImageUploader` | signed upload + progress |
| `EmptyState` | icon + message + CTA |
| `Toast` | success/error |
| `FeatureGate` | hide children if flag off |

---

## 7. Theming

- Tailwind theme extended from CSS variables loaded from `/config/public` after login (and on branding save).  
- Admin can stay slightly more “tool-like” (dense tables) than the consumer app, but **primary/accent** should match client brand.  
- Light/dark toggle optional for admin (lower priority than mobile).

Details: [12_DESIGN_SYSTEM](./12_DESIGN_SYSTEM.md).

---

## 8. API client rules

```ts
api.get/post/patch/delete(path, { auth: true })
```

- Attach Bearer access token  
- On 401 → refresh → retry once  
- Surface `error.code` to toasts  
- Never log tokens  

---

## 9. Permissions matrix (UI hide + API enforce)

| Nav / action | owner | staff |
|---|---|---|
| Dashboard, rates, catalog, enquiries, chat | ✓ | ✓ |
| Branding | ✓ | hidden |
| Staff | ✓ | hidden |
| Module toggles / keys | ✓ read-only info | hidden |
| Delete item | ✓ | ✓ (or restrict later) |

---

## 10. Admin implementation order

1. Auth layout + login + API client  
2. Shell + dashboard  
3. Rates  
4. Categories + items + uploader  
5. Enquiries  
6. Chat  
7. Branding  
8. Flagged pages  
9. Staff  

---

## 11. Acceptance criteria (admin)

- [ ] Owner can set rate and see it on mobile without redeploy  
- [ ] Full item create with 3 images works  
- [ ] Staff cannot open `/branding`  
- [ ] Chat reply appears for customer after refresh/FCM  
- [ ] Feature-off modules not in sidebar  
- [ ] Works on Chrome/Edge desktop 1280px+  
