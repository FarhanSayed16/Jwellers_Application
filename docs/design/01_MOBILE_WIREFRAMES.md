# Phase 02 — Mobile Wireframes (Flutter)

**Status:** Signed for engineering  
**Nav/spec source:** [11_MOBILE_APP_SCREENS.md](../11_MOBILE_APP_SCREENS.md)  
**Tokens:** [00_DESIGN_SYSTEM_BASELINE.md](./00_DESIGN_SYSTEM_BASELINE.md)  

For each screen: **Default · Loading · Empty · Error** (+ **Dark** on critical).  
Layout = structural wireframe (implement in Figma optionally; this pack is the checkpoint).

---

## Global chrome

### Bottom tabs
```
[ Home ] [ Collection ] [ Calculator ] [ Chat? ]
```
- Chat tab **only if** `FEATURE_CHAT=true`. Else 3 tabs, equal width.  
- Active tab = `color.primary` icon + label.  
- Safe-area padding above home indicator.

### Soft-login sheet (global)
```
┌─────────────────────────────┐
│  Login to continue          │
│  Save wishlist, enquire,    │
│  and chat with the store.   │
│  [ Continue with phone ]    │
│  [ Not now ]                │
└─────────────────────────────┘
```
After OTP success → return to `returnTo` route.

### Shared states pattern
- **Loading:** shimmer blocks matching layout (not spinner-only).  
- **Empty:** icon + 1 line + optional CTA.  
- **Error:** message + Retry button.  
- **Dark:** same structure; tokens swap via ThemeMode.

---

## 1. Splash / bootstrap `/splash`

```
┌──────────────────┐
│                  │
│     [LOGO]       │
│   Shop Name      │
│                  │
│    · · ·         │  (subtle progress)
└──────────────────┘
```
**Behavior:** load config + features + restore session → `/home`.  
**Error:** full-screen “Couldn’t load shop” + Retry (cannot skip unbranded).  
**Dark:** yes.

---

## 2. Home `/home` ⭐ critical + dark

```
┌──────────────────────────────┐
│ [Logo] ShopName    📞  🔔   │
├──────────────────────────────┤
│ ▓▓▓▓▓ HERO / BANNER ▓▓▓▓▓  │
├──────────────────────────────┤
│ 🔍 Search jewellery…         │
├──────────────────────────────┤
│ Gold │ Silver     Live · ts  │
│ [24K ₹] [22K ₹] [18K ₹]     │
├──────────────────────────────┤
│ New Arrivals          See all│
│ [img][img][img]→             │
├──────────────────────────────┤
│ Featured                     │
│ [img][img]→                  │
├──────────────────────────────┤
│ Categories preview rows…     │
└──────────────────────────────┘
     Home  Collection  Calc  Chat
```
**Loading:** shimmer hero + rate pills + rows.  
**Empty rates:** “Rates not set yet” (no fake numbers).  
**Empty catalog:** hide rows or “Coming soon”.  
**Error:** banner under app bar + Retry.  
**Pull-to-refresh:** yes.  
**First viewport rule:** no address block, no stat strip, no multi-promo stickers on hero.

---

## 3. Collection `/collection`

```
│ Categories                   │
│ ┌────┐ ┌────┐               │
│ │img │ │img │  2-col grid   │
│ │Name│ │Name│               │
│ └────┘ └────┘               │
```
Tap → subcategory or item grid if no children.  
**Empty:** “No collections yet”.  
**Dark:** yes.

---

## 4. Subcategory `/collection/:categoryId`

Same card grid; app bar = category name. Back to Collection.

---

## 5. Item grid `/collection/:cat/:sub`

```
│ Bali              🔍  ⚙     │
│ ┌──┐ ┌──┐                   │
│ │♥ │ │♥ │  image-dominant  │
│ │SKU│ │SKU│                 │
│ └──┘ └──┘                   │
```
Heart → auth gate if guest.  
**Filter sheet:** purity, metal, sort, new/featured.  
**Empty:** “No items in this style”.  
**Dark:** yes.

---

## 6. Item detail `/items/:id` ⭐ critical + dark

```
│ ←                 ♥         │
│ [======== gallery ========] │
│ Title                        │
│ SKU · 22K · 4.25g            │
│ [Hallmark badge if flag]     │
│ Price breakup                │
│  Metal ………                   │
│  Making ………                  │
│  GST ………                     │
│  Total ………                   │
│ [ Enquire ]                  │
│ [ Chat about item ]*         │
│ [ WhatsApp ]*                │
│ Size guide link              │
```
\* gated by flags.  
**Loading:** image shimmer + text lines.  
**Error:** Retry.  
**Missing weight:** show “Enquire for final price” instead of fake total.

---

## 7. Calculator `/calculator` ⭐ + dark

```
│ Calculator                   │
│ ┌ Today’s Rate · Live · date┐│
│ │ 22K ₹xxxxx /g             ││
│ └───────────────────────────┘│
│ Purity  (24K)(22K)(18K)      │
│ Weight (g)  [____.___]       │
│ Making %    [____]           │
│ GST %       [____]           │
│ ─────────────────            │
│ Metal / Making / GST / Total │
│ [ Reset ]                    │
```
Optional later: Share / WhatsApp.  
**Error loading rates:** Retry on rate card.

---

## 8. Rate history `/rates/history`

```
│ Rate history                 │
│ Purity chips                 │
│ [==== line chart ====]       │
│ Date        22K              │
│ 7 Sep       ₹xxxx            │
│ 6 Sep       ₹xxxx            │
```
**Empty:** “No history yet”.  
**Dark:** yes.

---

## 9. Size guide `/size-guide` (flag)

```
│ Size guide                   │
│ [Ring][Bangle][Necklace]     │
│ Reference chart (static)     │
│ Estimator: measure → size    │
│ [____] cm  → Size __         │
```

---

## 10. Search `/search`

```
│ 🔍 [ query____________ ]  ✕  │
│ Results grid (same as items) │
```
**Empty query:** recent/suggestions optional.  
**No results:** “No matches for …”

---

## 11. Auth phone `/auth/phone`

```
│ Login                        │
│ Enter mobile number          │
│ +91 [__________]             │
│ [ Send OTP ]                 │
│ By continuing you agree…     │
│ Privacy link                 │
```
**Error:** invalid / rate limited with countdown.

---

## 12. Auth OTP `/auth/otp`

```
│ Enter OTP                    │
│ Sent to +91••••••1234        │
│ [ ][ ][ ][ ][ ][ ]           │
│ Resend in 0:45               │
│ [ Verify ]                   │
```
**Error:** wrong OTP / locked.

---

## 13. Account `/account`

```
│ Account                      │
│ Name / Phone  or [Login]     │
│ Wishlist                     │
│ My Enquiries                 │
│ Custom Requests *            │
│ Offers *                     │
│ Rate History                 │
│ Size Guide *                 │
│ About Retailer               │
│ Theme  System|Light|Dark     │
│ Privacy                      │
│ Delete account               │
│ Log out                      │
```
\* feature flags. Guest sees Login CTA at top.

---

## 14. Wishlist `/wishlist` (auth)

List of product rows/cards.  
**Empty:** “Save designs you love” + Browse CTA.  
**Dark:** yes.

---

## 15. Enquiries `/enquiries` (auth)

```
│ My Enquiries                 │
│ [New] SKU · status · date    │
│ message preview…             │
```
**Empty:** “No enquiries yet”.

---

## 16. Custom requests (flag)

**List** + **New form:**
```
│ Description [ multiline ]    │
│ Photos [ + add ]             │
│ Budget (optional)            │
│ [ Submit ]                   │
```

---

## 17. Chat list `/chat` ⭐ (flag) + dark

```
│ Chats                        │
│ ● Customer thread preview    │
│   time · unread badge        │
```
**Empty:** “Chat with the store” + start general thread CTA.

---

## 18. Chat thread `/chat/:id` ⭐ + dark

```
│ ← Name · SKU optional        │
│ ┌ staff bubble ┐             │
│           ┌ customer ┐       │
│ [attach] [ message… ] [➤]    │
```
Idempotent send; image attachments.

---

## 19. About `/about`

Logo, address, phone (tap-to-call), GST, social links, WhatsApp.

---

## 20. Privacy `/legal/privacy`

In-app WebView or markdown from hosted URL.

---

## 21. Delete account `/account/delete`

```
│ Delete account               │
│ Warning copy                 │
│ Type DELETE to confirm       │
│ [ Delete permanently ]       │
│ [ Cancel ]                   │
```

---

## 22. Offers `/offers` (flag)

Banner cards with title + validity. Tap → detail optional.

---

## Screen state matrix (checkpoint)

| Screen | Default | Loading | Empty | Error | Dark |
|---|---|---|---|---|---|
| Splash | ✓ | ✓ | — | ✓ | ✓ |
| Home | ✓ | ✓ | ✓ | ✓ | ✓ |
| Collection / sub / grid | ✓ | ✓ | ✓ | ✓ | ✓ |
| Item detail | ✓ | ✓ | — | ✓ | ✓ |
| Calculator | ✓ | ✓ | — | ✓ | ✓ |
| Rate history | ✓ | ✓ | ✓ | ✓ | ✓ |
| Size guide | ✓ | — | — | — | ✓ |
| Search | ✓ | ✓ | ✓ | ✓ | ✓ |
| Auth phone/OTP | ✓ | ✓ | — | ✓ | ✓ |
| Account | ✓ | — | guest | — | ✓ |
| Wishlist / Enquiries | ✓ | ✓ | ✓ | ✓ | ✓ |
| Custom req | ✓ | ✓ | ✓ | ✓ | ✓ |
| Chat list/thread | ✓ | ✓ | ✓ | ✓ | ✓ |
| About / Privacy / Delete | ✓ | — | — | ✓ | ✓ |
| Soft-login sheet | ✓ | — | — | — | ✓ |

---

## Navigation notes for engineers

- `go_router` routes match [11](../11_MOBILE_APP_SCREENS.md) §3.2.  
- Deep link: `/items/sku/:sku`.  
- Auth gate wraps wishlist, enquire, chat, custom requests, delete.
