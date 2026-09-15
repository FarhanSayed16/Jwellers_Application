# Flutter mobile CI

**Phase 27:** Codemagic + GitHub analyze workflow are stubbed.

| File | Role |
|---|---|
| `codemagic.yaml` | Ratnaraj release AAB |
| `.github/workflows/mobile-aab.yml` | `flutter analyze` on mobile changes |
| `docs/phase27/CI_STUB.md` | How to wire secrets |

```bash
cd apps/mobile
flutter pub get
flutter analyze
flutter build appbundle --release --flavor ratnaraj -t lib/main_ratnaraj.dart
```

Requires `android/key.properties` for Play-signed release (see `docs/phase27/SIGNING_HANDOFF.md`).
