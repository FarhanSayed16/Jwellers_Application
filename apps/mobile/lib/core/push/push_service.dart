import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../flavor/flavor_config.dart';
import '../network/api_client.dart';
import 'firebase_options_resolver.dart';
import 'push_payload.dart';

const _kPushPrimedKey = 'push_permission_primed_v1';

/// Background isolate handler — keep minimal (no UI).
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  // Payload is opaque; app refreshes thread/rates when opened.
}

final pushServiceProvider = Provider<PushService>((ref) => PushService(ref));

class PushService {
  PushService(this._ref);

  final Ref _ref;
  bool _ready = false;
  void Function(PushPayload payload)? onOpened;

  bool get isReady => _ready;

  Future<bool> hasPrimedPermission() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(_kPushPrimedKey) ?? false;
  }

  Future<void> markPrimed() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_kPushPrimedKey, true);
  }

  /// Safe init — never throws; returns false if Firebase unavailable.
  ///
  /// Config sources (no shared hardcoded project):
  /// 1. `--dart-define=FIREBASE_*`
  /// 2. Native `android/app/src/<flavor>/google-services.json`
  Future<bool> init() async {
    if (kIsWeb) return false;
    try {
      if (Firebase.apps.isEmpty) {
        final fromDefines = FirebaseOptionsResolver.fromDartDefines();
        if (fromDefines != null) {
          await Firebase.initializeApp(options: fromDefines);
        } else {
          // Platform default — requires per-flavor google-services.json (or iOS plist).
          await Firebase.initializeApp();
        }
      }
      FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);

      FirebaseMessaging.onMessage.listen((message) {
        debugPrint('[push] foreground type=${message.data['type']}');
      });

      FirebaseMessaging.onMessageOpenedApp.listen((message) {
        final payload = PushPayload.fromData(Map<String, dynamic>.from(message.data));
        onOpened?.call(payload);
      });

      final initial = await FirebaseMessaging.instance.getInitialMessage();
      if (initial != null) {
        final payload = PushPayload.fromData(Map<String, dynamic>.from(initial.data));
        // Defer until router is ready
        Future<void>.delayed(const Duration(milliseconds: 400), () {
          onOpened?.call(payload);
        });
      }

      FirebaseMessaging.instance.onTokenRefresh.listen((token) {
        voidRegister(token);
      });

      _ready = true;
      return true;
    } catch (e, st) {
      final slug = FlavorConfig.isInitialized ? FlavorConfig.instance.slug : 'unknown';
      debugPrint(
        '[push] init skipped for flavor=$slug (add android/app/src/$slug/google-services.json '
        'or FIREBASE_* dart-defines): $e\n$st',
      );
      _ready = false;
      return false;
    }
  }

  Future<AuthorizationStatus> requestPermission() async {
    if (!_ready) {
      final ok = await init();
      if (!ok) return AuthorizationStatus.denied;
    }
    final settings = await FirebaseMessaging.instance.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    await markPrimed();
    return settings.authorizationStatus;
  }

  Future<String?> getToken() async {
    if (!_ready) return null;
    try {
      return await FirebaseMessaging.instance.getToken();
    } catch (e) {
      debugPrint('[push] getToken failed: $e');
      return null;
    }
  }

  Future<void> registerWithApiIfLoggedIn() async {
    final token = await getToken();
    if (token == null || token.isEmpty) return;
    await voidRegister(token);
  }

  Future<void> voidRegister(String fcmToken) async {
    try {
      final access = await _ref.read(tokenStoreProvider).getAccessToken();
      if (access == null || access.isEmpty) return;
      final platform = !kIsWeb && Platform.isIOS ? 'ios' : 'android';
      await _ref.read(apiClientProvider).postData(
            '/devices',
            body: {'fcmToken': fcmToken, 'platform': platform},
            parse: (_) => null,
          );
    } catch (e) {
      debugPrint('[push] register failed: $e');
    }
  }

  Future<void> unregisterCurrent() async {
    try {
      final token = await getToken();
      if (token == null) return;
      await _ref.read(apiClientProvider).deleteData(
            '/devices',
            body: {'fcmToken': token},
            parse: (_) => null,
          );
    } catch (_) {
      // Best-effort on logout
    }
  }
}
