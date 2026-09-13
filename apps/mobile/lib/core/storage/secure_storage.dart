import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Thin wrapper over secure storage (Keychain / Keystore / web localStorage).
class SecureStorageService {
  SecureStorageService({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  final FlutterSecureStorage _storage;

  Future<void> write(String key, String value) async {
    try {
      await _storage.write(key: key, value: value);
    } catch (e, st) {
      debugPrint('SecureStorage write failed: $e\n$st');
      rethrow;
    }
  }

  Future<String?> read(String key) async {
    try {
      return await _storage.read(key: key);
    } catch (e, st) {
      debugPrint('SecureStorage read failed: $e\n$st');
      return null;
    }
  }

  Future<void> delete(String key) async {
    try {
      await _storage.delete(key: key);
    } catch (e, st) {
      debugPrint('SecureStorage delete failed: $e\n$st');
    }
  }

  Future<void> deleteAll() async {
    try {
      await _storage.deleteAll();
    } catch (e, st) {
      debugPrint('SecureStorage deleteAll failed: $e\n$st');
    }
  }
}

class TokenStore {
  TokenStore(this._storage);

  final SecureStorageService _storage;

  static const _accessKey = 'customer_access_token';
  static const _refreshKey = 'customer_refresh_token';

  Future<String?> getAccessToken() => _storage.read(_accessKey);
  Future<String?> getRefreshToken() => _storage.read(_refreshKey);

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _storage.write(_accessKey, accessToken);
    await _storage.write(_refreshKey, refreshToken);
  }

  Future<void> clear() async {
    await _storage.delete(_accessKey);
    await _storage.delete(_refreshKey);
  }
}
