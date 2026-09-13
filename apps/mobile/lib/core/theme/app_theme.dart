import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../config/models.dart';

Color parseBrandColor(String hex) {
  var value = hex.trim();
  if (value.startsWith('#')) value = value.substring(1);
  if (value.length == 6) value = 'FF$value';
  return Color(int.parse(value, radix: 16));
}

@immutable
class AppTokens extends ThemeExtension<AppTokens> {
  const AppTokens({
    required this.accent,
    required this.border,
    required this.textSecondary,
  });

  final Color accent;
  final Color border;
  final Color textSecondary;

  factory AppTokens.fromThemeTokens(ThemeTokens t) => AppTokens(
        accent: parseBrandColor(t.accent),
        border: parseBrandColor(t.border),
        textSecondary: parseBrandColor(t.textSecondary),
      );

  @override
  AppTokens copyWith({
    Color? accent,
    Color? border,
    Color? textSecondary,
  }) {
    return AppTokens(
      accent: accent ?? this.accent,
      border: border ?? this.border,
      textSecondary: textSecondary ?? this.textSecondary,
    );
  }

  @override
  AppTokens lerp(ThemeExtension<AppTokens>? other, double t) {
    if (other is! AppTokens) return this;
    return AppTokens(
      accent: Color.lerp(accent, other.accent, t)!,
      border: Color.lerp(border, other.border, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
    );
  }
}

ThemeData buildThemeFromTokens({
  required ThemeTokens tokens,
  required Brightness brightness,
  String? displayFont,
  String? bodyFont,
}) {
  final primary = parseBrandColor(tokens.primary);
  final secondary = parseBrandColor(tokens.secondary);
  final background = parseBrandColor(tokens.background);
  final surface = parseBrandColor(tokens.surface);
  final onSurface = parseBrandColor(tokens.textPrimary);
  final error = parseBrandColor(tokens.error);

  final colorScheme = ColorScheme(
    brightness: brightness,
    primary: primary,
    onPrimary: brightness == Brightness.light ? Colors.white : const Color(0xFF0E1513),
    secondary: secondary,
    onSecondary: Colors.white,
    error: error,
    onError: Colors.white,
    surface: surface,
    onSurface: onSurface,
  );

  TextTheme textTheme = brightness == Brightness.light
      ? ThemeData.light().textTheme
      : ThemeData.dark().textTheme;

  // Skip remote font fetch in tests (allowRuntimeFetching=false) or on failure.
  if (GoogleFonts.config.allowRuntimeFetching) {
    try {
      final body = (bodyFont ?? 'Source Sans 3').toLowerCase();
      if (body.contains('source')) {
        textTheme = GoogleFonts.sourceSans3TextTheme(textTheme);
      }
    } catch (_) {}

    try {
      final display = (displayFont ?? 'Fraunces').toLowerCase();
      if (display.contains('fraunces')) {
        final displayTheme = GoogleFonts.frauncesTextTheme(textTheme);
        textTheme = textTheme.copyWith(
          displayLarge: displayTheme.displayLarge,
          displayMedium: displayTheme.displayMedium,
          displaySmall: displayTheme.displaySmall,
          headlineLarge: displayTheme.headlineLarge,
          headlineMedium: displayTheme.headlineMedium,
          headlineSmall: displayTheme.headlineSmall,
          titleLarge: displayTheme.titleLarge,
        );
      }
    } catch (_) {}
  }

  return ThemeData(
    useMaterial3: true,
    brightness: brightness,
    colorScheme: colorScheme,
    scaffoldBackgroundColor: background,
    textTheme: textTheme.apply(
      bodyColor: onSurface,
      displayColor: onSurface,
    ),
    appBarTheme: AppBarTheme(
      backgroundColor: primary,
      foregroundColor: colorScheme.onPrimary,
      elevation: 0,
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: surface,
      indicatorColor: primary.withValues(alpha: 0.15),
      labelTextStyle: WidgetStatePropertyAll(
        textTheme.labelMedium?.copyWith(fontWeight: FontWeight.w600),
      ),
    ),
    extensions: [AppTokens.fromThemeTokens(tokens)],
  );
}

ThemeData lightThemeFromConfig(PublicShopConfig config) => buildThemeFromTokens(
      tokens: config.themeLight,
      brightness: Brightness.light,
      displayFont: config.fontsDisplay,
      bodyFont: config.fontsBody,
    );

ThemeData darkThemeFromConfig(PublicShopConfig config) => buildThemeFromTokens(
      tokens: config.themeDark,
      brightness: Brightness.dark,
      displayFont: config.fontsDisplay,
      bodyFont: config.fontsBody,
    );

/// Seed theme before remote config loads (Demo palette).
ThemeData bootstrapLightTheme() => buildThemeFromTokens(
      tokens: const ThemeTokens(
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
      ),
      brightness: Brightness.light,
    );

ThemeData bootstrapDarkTheme() => buildThemeFromTokens(
      tokens: const ThemeTokens(
        primary: '#5EBFAB',
        secondary: '#3D7A6A',
        accent: '#E0C35A',
        background: '#0E1513',
        surface: '#1A2420',
        textPrimary: '#F3F6F5',
        textSecondary: '#A8B5B0',
        border: '#2A3531',
        success: '#81C784',
        warning: '#FFB74D',
        error: '#EF9A9A',
      ),
      brightness: Brightness.dark,
    );
