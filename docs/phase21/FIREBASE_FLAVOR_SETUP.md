# Firebase per flavor (C-02)

Push init no longer embeds a shared Firebase project in Dart source.

## Setup (each Client)

1. Create a Firebase project (or Android app) for that jeweller.
2. Register package id (`com.ratnaraj.jewellers`, `com.yourco.demojewellers`, `com.acme.jewellers`).
3. Download `google-services.json` and place it at:

```
apps/mobile/android/app/src/<flavor>/google-services.json
```

Examples (placeholders only) live next to each flavor as `google-services.json.example`.  
Real `google-services.json` files are gitignored (`**/google-services.json`).

## Optional CI override

```bash
flutter run --flavor ratnaraj \
  --dart-define=FIREBASE_API_KEY=... \
  --dart-define=FIREBASE_APP_ID=... \
  --dart-define=FIREBASE_MESSAGING_SENDER_ID=... \
  --dart-define=FIREBASE_PROJECT_ID=... \
  --dart-define=FIREBASE_STORAGE_BUCKET=...
```

If neither dart-defines nor a native `google-services.json` is present, push init fails soft and the app runs without FCM.
