# Phase 02 — Design System Baseline

**Status:** Locked for implementation (Phase 03+)  
**Refs:** [12_DESIGN_SYSTEM.md](../12_DESIGN_SYSTEM.md) · client token files

---

## 1. Principles (confirmed)

1. Jewellery photos are the hero; chrome stays quiet.  
2. Tokens only — no raw hex in feature widgets.  
3. Light + dark both explicit.  
4. Customer Home = one composition (no dashboard clutter).  
5. Feature-off modules are hidden, never empty shells.

---

## 2. Token list (agreed)

### Color roles
`primary` · `secondary` · `accent` · `background` · `surface` · `textPrimary` · `textSecondary` · `border` · `success` · `warning` · `error`

### Spacing (4px grid)
| Token | px |
|---|---|
| space.1 | 4 |
| space.2 | 8 |
| space.3 | 12 |
| space.4 | 16 |
| space.5 | 24 |
| space.6 | 32 |
| space.7 | 40 |
| space.8 | 48 |

### Radius
| Token | px |
|---|---|
| radius.sm | 8 |
| radius.md | 12 |
| radius.lg | 16 |

### Type scale
| Token | Mobile | Admin |
|---|---|---|
| size.xs | 12 | 12 |
| size.sm | 14 | 14 |
| size.md | 16 | 16 |
| size.lg | 20 | 18 |
| size.xl | 24 | 22 |
| size.display | 28–32 | 28 |

### Elevation
Prefer `border` + `surface` over heavy shadows. Max one subtle shadow on floating sheets/modals.

---

## 3. Fonts

| Client | Display (headings / brand) | Body (UI) | Notes |
|---|---|---|---|
| **Demo Jewellers** | **Fraunces** (Google Fonts) | **Source Sans 3** | Distinct, non-Inter; jewellery-friendly serif display |
| **Ratnaraj Jewellers** | **Cormorant Garamond** | **Nunito Sans** | Elegant display; highly readable body for India retail |

**License:** Google Fonts — OK for app embedding + web admin.  
**Fallback stacks:** display → Georgia, serif · body → system-ui, sans-serif  

Update `clients/*/branding/tokens.json` → `fonts.display` / `fonts.body` to match.

**Admin web:** Same body font as active client tokens; display for page titles only.

---

## 4. Palettes

### Demo — already in `clients/demo/branding/tokens.json`
- Light: deep teal primary `#1F4B3F`, gold accent `#C9A227`, warm paper background  
- Dark: teal primary `#5EBFAB`, dark green-black background `#0E1513`  

### Ratnaraj — already in `clients/ratnaraj/branding/tokens.json`
- Light: jewellery gold primary `#8B6914`, cream background `#FAF7F2`  
- Dark: bright gold `#D4AF37`, near-black `#121212`  

**⏸** Final Ratnaraj hex may change when Client approves intake — swap tokens only, no layout redo.

---

## 5. Icon sets (locked)

| Surface | Library | Why |
|---|---|---|
| **Admin (Next.js)** | **Lucide React** | Clean, consistent, Tailwind-friendly |
| **Mobile (Flutter)** | **Phosphor Icons** (`phosphor_flutter`) regular weight | Distinct from Material defaults; good jewellery-app feel |

Do not mix icon libraries within one surface.

---

## 6. Motion (customer app — ship these 3)

1. Home rate row fade/slide on refresh  
2. Hero fade-in on first load  
3. Wishlist heart scale pop  

Tab indicator: short slide. No glow loops.

---

## 7. Component inventory (build before feature screens)

Shared across states: PrimaryButton, SecondaryButton, TextField, OtpBoxes, Chip/PuritySelector, ProductImage, EmptyState, ErrorRetry, Skeleton, StatusBadge, BottomSheet/Dialog, AppBar/PageHeader.

---

## 8. Sign-off

| Item | Locked |
|---|---|
| Tokens | ✅ |
| Fonts | ✅ |
| Demo palette | ✅ |
| Ratnaraj palette (draft) | ✅ pending Client hex confirm |
| Icons | ✅ |
