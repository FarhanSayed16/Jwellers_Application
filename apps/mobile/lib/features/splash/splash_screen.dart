import 'dart:io' show Platform;

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/app_version.dart';
import '../../core/config/models.dart';
import '../../core/config/providers.dart';
import '../../core/flavor/flavor_config.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/push/push_service.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../wishlist/wishlist_provider.dart';

/// Splash bootstrap: flavor → config → soft/force update → silent auth → FCM → /home.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  String? _error;
  bool _loading = true;
  bool _blockedByForceUpdate = false;
  AppUpdateInfo? _updateInfo;

  /// Matches pubspec version; override with --dart-define=APP_VERSION=x.y.z
  static const _appVersion = String.fromEnvironment(
    'APP_VERSION',
    defaultValue: '1.0.0',
  );

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _bootstrap());
  }

  Future<void> _bootstrap() async {
    setState(() {
      _loading = true;
      _error = null;
      _blockedByForceUpdate = false;
    });

    try {
      final _ = FlavorConfig.instance;

      await Future.wait([
        ref.read(publicConfigProvider.notifier).reload(),
        ref.read(featuresProvider.notifier).reload(),
      ]);

      final config = ref.read(publicConfigProvider);
      final features = ref.read(featuresProvider);
      if (config.hasError) throw config.error!;
      if (features.hasError) throw features.error!;

      final shop = config.valueOrNull;
      final update = shop?.appUpdate;
      if (update != null &&
          needsForceUpdate(
            currentVersion: _appVersion,
            minVersion: update.minVersion,
            forceUpdateFlag: update.forceUpdate,
          )) {
        if (!mounted) return;
        setState(() {
          _loading = false;
          _blockedByForceUpdate = true;
          _updateInfo = update;
        });
        return;
      }

      final tokens = ref.read(tokenStoreProvider);
      final refresh = await tokens.getRefreshToken();
      if (refresh != null && refresh.isNotEmpty) {
        await _trySilentRefresh(refresh);
        await ref.read(authProvider.notifier).reload();
        await ref.read(wishlistIdsProvider.notifier).reload();
      }

      final push = ref.read(pushServiceProvider);
      await push.init();
      push.onOpened = (payload) {
        if (!mounted) return;
        final route = payload.route;
        if (route != null) context.go(route);
      };
      await push.registerWithApiIfLoggedIn();

      if (!mounted) return;
      final primed = await push.hasPrimedPermission();
      if (!mounted) return;
      context.go(primed ? '/home' : '/notifications/prime');
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException
            ? e.message
            : 'Could not load shop configuration. Check API_BASE_URL and try again.';
      });
    }
  }

  Future<void> _trySilentRefresh(String refreshToken) async {
    try {
      final api = ref.read(apiClientProvider);
      final data = await api.postData<Map<String, dynamic>>(
        '/auth/customer/token/refresh',
        body: {'refreshToken': refreshToken},
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      final access = data['accessToken']?.toString();
      final next = data['refreshToken']?.toString();
      if (access != null && next != null) {
        await ref.read(tokenStoreProvider).saveTokens(
              accessToken: access,
              refreshToken: next,
            );
      }
    } catch (_) {
      await ref.read(tokenStoreProvider).clear();
    }
  }

  Future<void> _openStore() async {
    final info = _updateInfo;
    if (info == null) return;
    final url = (!kIsWeb && Platform.isIOS)
        ? (info.storeUrlIos ?? info.storeUrlAndroid)
        : (info.storeUrlAndroid ?? info.storeUrlIos);
    if (url == null || url.isEmpty) return;
    final uri = Uri.tryParse(url);
    if (uri == null) return;
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }

  @override
  Widget build(BuildContext context) {
    final flavor = FlavorConfig.instance;
    final shopName =
        ref.watch(publicConfigProvider).valueOrNull?.shopName ?? flavor.appName;

    if (_blockedByForceUpdate) {
      return Scaffold(
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Update required',
                  style: Theme.of(context).textTheme.headlineSmall,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  'A newer version of $shopName is required to continue '
                  '(min ${_updateInfo?.minVersion ?? ''}).',
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: _openStore,
                  child: const Text('Update app'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: AppErrorRetry(
          message: _error!,
          onRetry: _bootstrap,
        ),
      );
    }

    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              shopName,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
            ),
            const SizedBox(height: 24),
            if (_loading) const CircularProgressIndicator(),
            const SizedBox(height: 16),
            Text(
              'Loading ${flavor.slug}…',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ],
        ),
      ),
    );
  }
}
