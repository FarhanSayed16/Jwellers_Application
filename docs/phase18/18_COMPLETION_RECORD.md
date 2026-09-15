# Phase 18 — Completion Record

**Phase:** 18 — Mobile — Calculator, rate history, size guide  
**Completed:** 2026-09-07  

---

## Checklist

### 18.1 Calculator
- [x] Today’s rate card (Live + date) from `/rates/latest`
- [x] Purity chips · weight · making · GST
- [x] Breakup via `POST /calculator/quote`
- [x] Reset · optional WhatsApp share text

### 18.2 Rate history
- [x] `fl_chart` line chart + dated list
- [x] Purity/silver series selector
- [x] Feature-gated (`FEATURE_RATE_HISTORY`)

### 18.3 Size guide
- [x] Ring / Bangle / Necklace charts + estimator
- [x] Entry: Account hub · item detail (when sizeInfo / flag)
- [x] Feature-gated (`FEATURE_SIZE_GUIDE`)

### 18.4 Gate
- [x] Quote formula matches API (`computeQuoteBreakup` ↔ `calculateQuote`)
- [x] History sorts newest-first when a new admin rate is appended

---

## Key files

| Path | Role |
|---|---|
| `lib/features/calculator/calculator_screen.dart` | Calculator |
| `lib/features/rates/rate_history_screen.dart` | History chart/list |
| `lib/features/size_guide/size_guide_screen.dart` | Size charts |
| `lib/features/account/account_screen.dart` | Entry hub (Phase 19 expands auth) |

## Verify

```bash
cd apps/mobile
flutter analyze
flutter test
```

## Next

**Phase 19 — Auth, account, wishlist, enquire, WhatsApp**
