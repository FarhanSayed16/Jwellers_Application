import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/config/providers.dart';
import 'core/flavor/flavor_config.dart';
import 'core/router/app_router.dart';
import 'core/router/deep_link_listener.dart';
import 'core/theme/app_theme.dart';

class JwellersApp extends ConsumerWidget {
  const JwellersApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeModeProvider);
    final config = ref.watch(publicConfigProvider).valueOrNull;

    final light = config != null ? lightThemeFromConfig(config) : bootstrapLightTheme();
    final dark = config != null ? darkThemeFromConfig(config) : bootstrapDarkTheme();

    return DeepLinkListener(
      child: MaterialApp.router(
        title: config?.shopName ?? FlavorConfig.instance.appName,
        debugShowCheckedModeBanner: false,
        theme: light,
        darkTheme: dark,
        themeMode: themeMode,
        routerConfig: router,
      ),
    );
  }
}
