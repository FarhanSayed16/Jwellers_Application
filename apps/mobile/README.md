# Mobile app (`apps/mobile`)

White-label Flutter customer app. **Phase 16** foundation: flavors, Dio, Riverpod, go_router, remote theme.

## Run (Demo)

```bash
cd apps/mobile
flutter pub get

# Desktop / Chrome (no Android flavor required)
flutter run -d windows -t lib/main_demo.dart
flutter run -d chrome -t lib/main_demo.dart

# Android (requires product flavor)
flutter run --flavor demo -t lib/main_demo.dart
```

Override API base:

```bash
flutter run -t lib/main_demo.dart --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1
```

Default API: `http://localhost:4000/api/v1`

## Ratnaraj stub

```bash
flutter run --flavor ratnaraj -t lib/main_ratnaraj.dart
```

## Verify Phase 16–17 gates

```bash
flutter test
flutter analyze
```

Phase 16: theme tokens · Chat tab on/off.  
Phase 17: quote purity mapping · light/dark image placeholders · catalog UI.  
Phase 18: calculator formula vs API · rate history series/sort · size guide.  
Phase 19: phone normalize · enquiry DTO · guest soft-gate.  
Phase 20: chat thread/message DTOs · tab gated by FEATURE_CHAT.
