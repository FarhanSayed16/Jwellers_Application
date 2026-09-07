# 12 — Design System & Page Design Rules

**Source of truth for:** visual tokens, layout rules, shared components across **Flutter** and **Admin web**.  
**Related:** [01](./01_PRODUCT_AND_ARCHITECTURE.md) §4 · [10](./10_ADMIN_WEB_PAGES.md) · [11](./11_MOBILE_APP_SCREENS.md)

---

## 1. Principles

1. **Jewellery-first** — photos are the hero; UI chrome stays quiet.  
2. **Tokens only** — no raw hex in widgets/components.  
3. **Light + dark both designed** — not auto-inverted.  
4. **One composition per screen** — avoid dashboard clutter on customer Home.  
5. **White-label safe** — swapping tokens/logo must not break contrast on real product photos.

Admin may be denser (tables, forms). Customer app stays browse/marketing calm.

---

## 2. Design tokens

### 2.1 Color roles (both palettes)

| Token | Role |
|---|---|
| `color.primary` | Brand actions, key CTAs, active tab |
| `color.secondary` | Secondary buttons, chips |
| `color.accent` | Highlights (e.g. “Live”, offers) — use sparingly |
| `color.background` | Page background |
| `color.surface` | Cards/sheets (prefer subtle elevation, not heavy shadows) |
| `color.textPrimary` | Main text |
| `color.textSecondary` | Meta, timestamps |
| `color.border` | Dividers, input borders |
| `color.success` / `warning` / `error` | Status |

Stored in `shop_configs.themeLight` / `themeDark` ([03](./03_DATA_MODEL.md)).

### 2.2 Typography

| Token | Mobile use | Admin use |
|---|---|---|
| `font.family.display` | Shop name / hero labels | Page titles |
| `font.family.body` | UI body | Forms/tables |
| `font.size.xs–xl` | Scale | Scale |

**Avoid** default Inter/Roboto-only look if possible — pick one distinctive display + one readable body per client branding pass. Document chosen fonts in `clients/<slug>/branding`.

### 2.3 Spacing & radius

| Token | Default suggestion |
|---|---|
| `space.1–8` | 4px grid (4,8,12,16,24,32…) |
| `radius.sm/md/lg` | 8 / 12 / 16 — consistent, not “pill everything” |
| `elevation` | Prefer border/subtle surface over multi-shadow stacks |

### 2.4 Mapping

| Platform | Mechanism |
|---|---|
| Flutter | `ThemeData` + `ColorScheme` + custom `AppTokens` extension |
| Admin | CSS variables on `:root` / `.dark` + Tailwind `theme.extend.colors` |

---

## 3. Customer app — screen design rules

### Home (first viewport)

Include only:

- Brand (logo + name)  
- One short rate context  
- Hero media  
- Primary browse paths (search / categories / new)  

Do **not** pack stats, long address blocks, or multiple promo cards into the first fold.

### Cards

- Product tiles: image-dominant; minimal text; wishlist control.  
- Avoid card-in-card.  
- Rate “cards” OK as structured info, keep flat.

### Motions (ship 2–3)

1. Home rate row fade/slide on refresh  
2. Hero subtle scale or fade-in  
3. Wishlist heart pop  
Optional: tab indicator animation  

No continuous glow/noise animations.

### Imagery

- Prefer dark or neutral photo backgrounds (matches trade photography).  
- Ensure `textPrimary` contrast on overlays (scrim if text on image).  
- Watermark: low opacity, consistent corner.

---

## 4. Admin — screen design rules

- **Clarity over brand theater** — retailer efficiency first.  
- Left nav + content; sticky page headers with primary CTA.  
- Forms: sectioned, labels above fields, destructive actions separated.  
- Tables: zebra optional; clear Status badges.  
- Toasts for success; dialogs for delete.  
- Branding page is the one place with live token preview (phone mock).

---

## 5. Shared component inventory

| Component | Mobile | Admin |
|---|---|---|
| Primary / secondary button | ✓ | ✓ |
| Text field / OTP boxes | ✓ | ✓ |
| Chip / purity selector | ✓ | ✓ |
| Product image | ✓ | thumb in table |
| Empty state | ✓ | ✓ |
| Error + retry | ✓ | ✓ |
| Skeleton | ✓ | ✓ |
| Status badge | limited | ✓ |
| Bottom sheet / modal | ✓ | dialog |
| App bar / page header | ✓ | ✓ |

---

## 6. Wireframe checklist (before coding UI)

For every screen in [10](./10_ADMIN_WEB_PAGES.md) and [11](./11_MOBILE_APP_SCREENS.md), Figma/paper must show:

- [ ] Default state  
- [ ] Loading  
- [ ] Empty  
- [ ] Error  
- [ ] Dark mode (customer critical screens)  

Minimum customer set to wireframe first: Splash, Home, Collection, Item grid, Item detail, Calculator, Auth phone/OTP, Account, Chat list, Chat thread, Wishlist.

Minimum admin set: Login, Dashboard, Rates, Items list, Item form, Enquiries, Chat, Branding.

---

## 7. Accessibility & device

| Rule | Spec |
|---|---|
| Tap targets | ≥ 44px mobile |
| Font scaling | Respect system text scale reasonably |
| Contrast | WCAG AA where feasible on UI chrome |
| Admin | Keyboard focus visible on forms |
| Safe areas | Notch/home indicator padding |

---

## 8. Asset rules

| Asset | Spec |
|---|---|
| Logo | SVG/PNG transparent; light + dark variants if needed |
| Icons | Single icon set (e.g. Lucide admin / Phosphor Flutter) |
| Hero | Client-provided; max weight guided via Cloudinary |
| Favicon / Play icon | Per flavor |

Store under `clients/<slug>/branding/`.

---

## 9. Do / Don’t (customer app)

| Do | Don’t |
|---|---|
| Let jewellery photos dominate | Purple gradient generic AI look |
| Explicit light & dark palettes | Auto-invert only |
| One primary CTA per section | Floating sticker spam on hero |
| Tokenized colors | Hardcoded `Color(0xFF…)` in features |
| Hide disabled modules | Empty Chat tab |

---

## 10. Handoff to engineering

1. Token JSON sample for Demo + Ratnaraj  
2. Font files licensed for app embedding  
3. Component list above implemented in `shared/widgets` and `components/ui` before feature screens  
4. Screenshot QA against wireframes in light + dark  
