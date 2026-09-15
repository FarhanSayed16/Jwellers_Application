# Phase 16 — Completion Record

**Phase:** 16 — Mobile — foundation, flavors, theme, router  
**Completed:** 2026-09-07  

---

## Checklist

### 16.1 Flavors
- [x] `demo` Android productFlavor · `com.yourco.demojewellers` · `main_demo.dart`
- [x] `ratnaraj` stubs · `com.ratnaraj.jewellers` · `main_ratnaraj.dart`
- [x] Flavor entrypoints + `FlavorConfig` (API URL via `--dart-define=API_BASE_URL`)

### 16.2 Core libs
- [x] Dio + auth refresh queue interceptor
- [x] Secure storage / token store
- [x] go_router full route table (placeholders OK)
- [x] Riverpod root · `publicConfigProvider` · `featuresProvider` · `themeModeProvider`
- [x] ThemeData from remote tokens (light/dark/system)
- [x] Splash bootstrap (config → theme → silent refresh → `/home`, retry on failure)

### 16.3 Shared widgets
- [x] Primary/secondary buttons · skeletons · empty/error+retry · cached image

### 16.4 Gate
- [x] Theme from Demo tokens
- [x] Chat tab absent when `chat=false` · present when `chat=true`

---

## Verify

```bash
cd apps/mobile
flutter pub get
flutter analyze
flutter test
```

Run Demo (API on `:4000`):

```bash
flutter run -d windows -t lib/main_demo.dart
# Android:
flutter run --flavor demo -t lib/main_demo.dart
```

---

## Deferred

| Item | Target |
|---|---|
| Brand launcher icons + native splash art | Phase 26 (client assets) |
| iOS Xcode schemes / bundle IDs | Phase 26–27 |
| FCM priming on splash | Phase 21 |

---

## Next

**Phase 17 — Mobile Home, Collection, Item detail**
