import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../network/api_client.dart';
import 'models.dart';

final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.light);

final publicConfigProvider =
    AsyncNotifierProvider<PublicConfigNotifier, PublicShopConfig>(
  PublicConfigNotifier.new,
);

final featuresProvider =
    AsyncNotifierProvider<FeaturesNotifier, FeatureFlags>(FeaturesNotifier.new);

class PublicConfigNotifier extends AsyncNotifier<PublicShopConfig> {
  @override
  Future<PublicShopConfig> build() => _fetch();

  Future<PublicShopConfig> _fetch() {
    final api = ref.read(apiClientProvider);
    return api.getData(
      '/config/public',
      parse: (json) =>
          PublicShopConfig.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }
}

class FeaturesNotifier extends AsyncNotifier<FeatureFlags> {
  @override
  Future<FeatureFlags> build() => _fetch();

  Future<FeatureFlags> _fetch() {
    final api = ref.read(apiClientProvider);
    return api.getData(
      '/config/features',
      parse: (json) =>
          FeatureFlags.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_fetch);
  }

  /// Test / dogfood override for FEATURE_CHAT gate.
  void overrideChat(bool enabled) {
    final current = state.valueOrNull;
    if (current == null) return;
    state = AsyncData(current.copyWith(chat: enabled));
  }
}
