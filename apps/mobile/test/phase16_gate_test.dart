import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/config/models.dart';
import 'package:mobile/core/config/providers.dart';
import 'package:mobile/core/flavor/flavor_config.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/features/shell/main_shell.dart';

const _demoLight = ThemeTokens(
  primary: '#1F4B3F',
  secondary: '#3D7A6A',
  accent: '#C9A227',
  background: '#F7F5F0',
  surface: '#FFFFFF',
  textPrimary: '#14201C',
  textSecondary: '#5A6B65',
  border: '#D9D3C7',
  success: '#2E7D32',
  warning: '#ED6C02',
  error: '#C62828',
);

FeatureFlags _flags({required bool chat}) => FeatureFlags(
      chat: chat,
      whatsapp: true,
      rateHistory: true,
      sizeGuide: true,
      offers: true,
      customRequests: true,
      hallmark: true,
    );

PublicShopConfig get _config => const PublicShopConfig(
      clientSlug: 'demo',
      shopName: 'Demo Jewellers',
      logoUrl: '',
      contactPhone: '9999999999',
      themeLight: _demoLight,
      themeDark: _demoLight,
      fontsDisplay: 'Fraunces',
      fontsBody: 'Source Sans 3',
      source: 'test',
    );

void main() {
  setUpAll(() {
    GoogleFonts.config.allowRuntimeFetching = false;
    if (!FlavorConfig.isInitialized) {
      FlavorConfig.init(FlavorConfig.demo(apiBaseUrl: 'http://localhost:4000/api/v1'));
    }
  });

  test('theme applies demo primary from tokens', () {
    final theme = lightThemeFromConfig(_config);
    expect(theme.colorScheme.primary, parseBrandColor('#1F4B3F'));
    expect(theme.scaffoldBackgroundColor, parseBrandColor('#F7F5F0'));
  });

  testWidgets('Chat tab absent when FEATURE_CHAT=false', (tester) async {
    await _pumpShell(tester, chat: false);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Collection'), findsOneWidget);
    expect(find.text('Calculator'), findsOneWidget);
    expect(find.text('Chat'), findsNothing);
  });

  testWidgets('Chat tab present when FEATURE_CHAT=true', (tester) async {
    await _pumpShell(tester, chat: true);
    expect(find.text('Chat'), findsOneWidget);
  });
}

Future<void> _pumpShell(WidgetTester tester, {required bool chat}) async {
  final router = GoRouter(
    initialLocation: '/home',
    routes: [
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/home',
            builder: (context, state) => const Scaffold(body: Text('home-body')),
          ),
          GoRoute(
            path: '/collection',
            builder: (context, state) =>
                const Scaffold(body: Text('collection-body')),
          ),
          GoRoute(
            path: '/calculator',
            builder: (context, state) => const Scaffold(body: Text('calc-body')),
          ),
          GoRoute(
            path: '/chat',
            builder: (context, state) => const Scaffold(body: Text('chat-body')),
          ),
        ],
      ),
    ],
  );

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        featuresProvider.overrideWith(() => _FeaturesStub(_flags(chat: chat))),
        publicConfigProvider.overrideWith(() => _ConfigStub(_config)),
      ],
      child: MaterialApp.router(
        theme: lightThemeFromConfig(_config),
        routerConfig: router,
      ),
    ),
  );
  await tester.pumpAndSettle();
}

class _FeaturesStub extends FeaturesNotifier {
  _FeaturesStub(this._flags);
  final FeatureFlags _flags;

  @override
  Future<FeatureFlags> build() async => _flags;
}

class _ConfigStub extends PublicConfigNotifier {
  _ConfigStub(this._config);
  final PublicShopConfig _config;

  @override
  Future<PublicShopConfig> build() async => _config;
}
