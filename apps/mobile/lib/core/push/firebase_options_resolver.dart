import 'package:firebase_core/firebase_core.dart';

/// Resolves Firebase options without baking a shared project into source.
///
/// Priority:
/// 1. `--dart-define=FIREBASE_*` (CI / explicit override)
/// 2. Native `google-services.json` / `GoogleService-Info.plist` via
///    [Firebase.initializeApp] with no options (caller handles that path)
///
/// Never hardcode a shared Kavach (or any) project here — each Client must
/// supply their own Firebase Android/iOS app under `android/app/src/<flavor>/`.
class FirebaseOptionsResolver {
  FirebaseOptionsResolver._();

  static const _apiKey = String.fromEnvironment('FIREBASE_API_KEY');
  static const _appId = String.fromEnvironment('FIREBASE_APP_ID');
  static const _messagingSenderId = String.fromEnvironment('FIREBASE_MESSAGING_SENDER_ID');
  static const _projectId = String.fromEnvironment('FIREBASE_PROJECT_ID');
  static const _storageBucket = String.fromEnvironment('FIREBASE_STORAGE_BUCKET');

  /// Returns options when all required dart-defines are present; otherwise null.
  static FirebaseOptions? fromDartDefines() {
    if (_apiKey.isEmpty ||
        _appId.isEmpty ||
        _messagingSenderId.isEmpty ||
        _projectId.isEmpty) {
      return null;
    }
    return FirebaseOptions(
      apiKey: _apiKey,
      appId: _appId,
      messagingSenderId: _messagingSenderId,
      projectId: _projectId,
      storageBucket: _storageBucket.isEmpty ? null : _storageBucket,
    );
  }
}
