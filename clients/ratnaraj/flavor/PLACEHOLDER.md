# Ratnaraj flavor

| Field | Value |
|---|---|
| applicationId | `com.ratnaraj.jewellers` |
| Display name | Ratnaraj Jewellers |
| Dart entry | `apps/mobile/lib/main_ratnaraj.dart` |
| Android flavor | `ratnaraj` |
| API URL | Pass `--dart-define=API_BASE_URL=https://<ratnaraj-api>/api/v1` (no localhost in store builds) |

```bash
# Local against running API
flutter run --flavor ratnaraj -t lib/main_ratnaraj.dart

# Against provisioned stack
flutter run --flavor ratnaraj -t lib/main_ratnaraj.dart \
  --dart-define=API_BASE_URL=https://<ratnaraj-api>/api/v1 \
  --dart-define=APP_VERSION=1.0.0
```

## Assets pending Client delivery

- Launcher icons → `android/app/src/ratnaraj/res/mipmap-*`
- Splash / logo → `clients/ratnaraj/branding/` then Cloudinary `logoUrl` in shop_config
- `google-services.json` for Firebase (flavor-specific)

## Store AAB (Phase 27)

```bash
# With apps/mobile/android/key.properties present:
flutter build appbundle --release --flavor ratnaraj -t lib/main_ratnaraj.dart \
  --dart-define=API_BASE_URL=https://<ratnaraj-api>/api/v1 \
  --dart-define=APP_VERSION=1.0.0
```

Docs: `docs/phase27/` · Codemagic: repo `codemagic.yaml`.
