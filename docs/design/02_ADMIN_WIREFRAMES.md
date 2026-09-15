# Phase 02 — Admin Web Wireframes (Next.js)

**Status:** Signed for engineering  
**Page source:** [10_ADMIN_WEB_PAGES.md](../10_ADMIN_WEB_PAGES.md)  
**Tokens/icons:** Lucide · client CSS variables from `/config/public`

Desktop-first (1280px+). Collapse sidebar &lt; 768px.  
States: Default · Loading · Empty · Error (toasts for mutations).

---

## Global shell `(app)/layout`

```
┌──────────┬─────────────────────────────────────┐
│ [Logo]   │ Page title              User · Logout│
│ Shop     ├─────────────────────────────────────┤
│          │                                     │
│ Dashboard│         Page content                │
│ Rates    │                                     │
│ Catalog ▸│                                     │
│  Cats    │                                     │
│  Items   │                                     │
│ Enquiries│                                     │
│ Chat *   │                                     │
│ Offers * │                                     │
│ Branding†│                                     │
│ Staff †  │                                     │
│ Invoices*│                                     │
│ Payments*│                                     │
│ Settings │                                     │
└──────────┴─────────────────────────────────────┘
```
\* feature flag · † owner only  

**Nav rules:** hide flagged-off items; staff never sees Branding/Staff.

---

## 1. Login `/login`

```
┌────────────────────┐
│      [Logo]        │
│  Retailer Admin    │
│ Email or phone     │
│ [______________]   │
│ Password           │
│ [______________]   │
│ [ Sign in ]        │
│ Forgot password?   │
└────────────────────┘
```
No sign-up.  
**Error:** inline under form (invalid / locked).  
**Loading:** button busy state.

### Forgot `/forgot-password`
Email/phone → “If account exists, reset link sent”.

### Reset `/reset-password`
New password + confirm → success → login.

---

## 2. Dashboard `/`

```
│ Dashboard                          │
│ ┌ Today’s rates ──────────────┐   │
│ │ 24K 22K 18K Ag · timestamp  │   │
│ │ [ Update rates ]            │   │
│ └─────────────────────────────┘   │
│ [Items] [New enquiries] [Chats]   │
│ Needs attention                   │
│  · Enquiry #…                     │
│  · Unread chat…                   │
│ Quick: Add item · Open chat       │
```
**Empty rates:** big CTA “Set today’s rate”.  
**Loading:** skeleton cards.

---

## 3. Rates `/rates`

```
│ Rates                    [Save]   │
│ Gold 24K [    ]  22K [    ]       │
│ 18K [    ]  Silver [    ]         │
│ ☑ Notify app customers            │
│ ───────────────────────────────── │
│ History                           │
│ Date/time · values · by whom      │
```
**Confirm dialog** if change &gt; 8% vs previous.  
**Success toast** after save.

---

## 4. Categories `/catalog/categories`

```
│ Categories              [+ Add]   │
│ ▼ Earrings                        │
│    · Bali   · Tops   [edit][del]  │
│ ▼ Bangles                         │
```
Cover image thumb · sort order · soft delete confirm.  
**Empty:** “Add your first category”.

---

## 5. Items list `/catalog/items`

```
│ Items     [Filters] [+ Add item]  │
│ Search SKU/title…                 │
│ □ Thumb SKU Title Purity Status ⚙ │
│ … table rows …                    │
```
Filters: category, subcategory, status, featured/new.  
Row actions: Edit · Clone · Archive · Restore.  
**Empty:** CTA Add item.

---

## 6. Item form `/catalog/items/new` · `[id]`

Single scroll, sections:

1. **Basics** — title, SKU, category, subcategory, status  
2. **Metal** — metal, purity, HUID + stamp (if hallmark flag)  
3. **Weight** — gross / net  
4. **Making** — inherit / % / flat  
5. **Media** — multi upload, primary star, reorder  
6. **Merchandising** — tags, new, featured, description, stones, size info  

Banner: image quality guidance (~1500×1500, plain bg).  
Footer: Save · Save & add another · Delete (edit only).

---

## 7. Enquiries `/enquiries` · `/enquiries/[id]`

**List tabs:** New | In progress | Closed  
**Detail:**
```
│ Customer phone/name               │
│ Item link                         │
│ Message                           │
│ Status [select]  Assign [select]  │
│ [ Open chat ] (if exists)         │
```

---

## 8. Custom requests `/custom-requests` (flag)

Same pattern as enquiries; lightbox for reference images.

---

## 9. Chat `/chat` · `/chat/[threadId]` ⭐

```
┌────────────┬──────────────────────┐
│ Threads    │ Customer · SKU       │
│ search     │ status [open ▾]      │
│ ● unread   │ message history      │
│            │ [+][ type… ][ Send ] │
└────────────┴──────────────────────┘
```
Poll 5–10s or refresh on focus.  
**Empty list:** “No chats yet”.  
**Hidden entirely if flag off.**

---

## 10. Offers `/offers` (flag)

Card list + form: title, description, banner, validFrom/Till, active toggle.

---

## 11. Branding `/branding` (owner)

```
│ Branding                          │
│ Identity: name, logo, contact,    │
│   address, GST, BIS               │
│ Theme Light: color pickers        │
│ Theme Dark: color pickers         │
│ Defaults: making, GST %           │
│ Social links                      │
│ ┌ Phone mock preview ┐            │
│ └────────────────────┘            │
│ [ Save ]                          │
```
Warning: “Customers see colors after app refresh; store icon needs new build.”

---

## 12. Staff `/staff` (owner)

Table: name, phone/email, role, active.  
[+ Invite staff] → name, contact, temp password.  
Deactivate action.

---

## 13. Settings `/settings`

- Profile / change password  
- Feature modules **read-only** (“Chat: ON — contact support to change”)  
- Privacy / support links  
- Logout  

---

## 14. Invoices `/invoices` (flag off by default)

Placeholder list + “Create invoice” — build in Phase 30.  
**Nav hidden when flag false.**

---

## 15. Payments `/payments` (flag off by default)

Placeholder table of payment statuses.  
**Nav hidden when flag false.**

---

## Admin state matrix

| Page | Default | Loading | Empty | Error |
|---|---|---|---|---|
| Login / forgot / reset | ✓ | ✓ | — | ✓ |
| Dashboard | ✓ | ✓ | ✓ | ✓ |
| Rates | ✓ | ✓ | ✓ history | ✓ |
| Categories | ✓ | ✓ | ✓ | ✓ |
| Items list / form | ✓ | ✓ | ✓ | ✓ |
| Enquiries | ✓ | ✓ | ✓ | ✓ |
| Custom requests | ✓ | ✓ | ✓ | ✓ |
| Chat | ✓ | ✓ | ✓ | ✓ |
| Offers | ✓ | ✓ | ✓ | ✓ |
| Branding | ✓ | ✓ | — | ✓ |
| Staff | ✓ | ✓ | ✓ | ✓ |
| Settings | ✓ | ✓ | — | ✓ |
| Invoices / Payments | placeholder | — | — | — |

---

## Permission matrix (UI)

| Nav / action | owner | staff |
|---|---|---|
| Dashboard, rates, catalog, enquiries, chat | ✓ | ✓ |
| Branding, Staff | ✓ | hidden |
| Module flags display | ✓ read-only | hidden |
