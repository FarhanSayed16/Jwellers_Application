# Phase 17 — Completion Record

**Phase:** 17 — Mobile — Home, Collection, Item detail  
**Completed:** 2026-09-07  

---

## Checklist

### 17.1 Home
- [x] App bar logo/name, call (`tel:`), bell stub (Phase 21)
- [x] Hero banner
- [x] Search entry → `/search`
- [x] Rates cards · gold/silver toggle · timestamp · Live · history link
- [x] New arrivals / featured / category rows
- [x] Pull-to-refresh

### 17.2 Collection
- [x] Category grid · subcategory grid · item grid
- [x] Wishlist heart + soft-login sheet
- [x] Search (title/SKU/tags)
- [x] Filters sheet (metal, purity, sort)

### 17.3 Item detail
- [x] Gallery · SKU/title/metal/purity/weights
- [x] Price breakup via `POST /calculator/quote`
- [x] Enquire / Chat / WhatsApp CTAs (feature-gated)
- [x] Hallmark badge when flag + HUID

### 17.4 Gate
- [x] Catalog UI wired to public APIs (empty states when no DB data)
- [x] Light + dark image placeholder check (`phase17_gate_test`)

---

## Key files

| Path | Role |
|---|---|
| `lib/features/home/home_screen.dart` | Home feed |
| `lib/features/collection/*` | Browse + filters |
| `lib/features/search/search_screen.dart` | Search |
| `lib/features/item/item_detail_screen.dart` | Detail + quote |
| `lib/features/catalog/providers.dart` | Rates / feed / items |

## Verify

```bash
cd apps/mobile
flutter analyze
flutter test
flutter run -d windows -t lib/main_demo.dart
```

Populate catalog via Admin or `npm run verify:catalog -w @jwellers/api` (needs Mongo).

## Next

**Phase 18 — Calculator, rate history, size guide**
