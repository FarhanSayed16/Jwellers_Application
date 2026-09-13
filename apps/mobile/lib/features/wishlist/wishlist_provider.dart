import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';

final wishlistIdsProvider =
    AsyncNotifierProvider<WishlistIdsNotifier, Set<String>>(
  WishlistIdsNotifier.new,
);

class WishlistIdsNotifier extends AsyncNotifier<Set<String>> {
  @override
  Future<Set<String>> build() async {
    final token = await ref.read(tokenStoreProvider).getAccessToken();
    if (token == null || token.isEmpty) return {};
    try {
      final api = ref.read(apiClientProvider);
      final data = await api.getData<Map<String, dynamic>>(
        '/wishlist',
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      final items = data['items'] as List? ?? const [];
      return items
          .map((e) => (e as Map)['itemId']?.toString() ?? '')
          .where((id) => id.isNotEmpty)
          .toSet();
    } on ApiException {
      return {};
    }
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(build);
  }

  /// Returns false if caller should soft-gate login.
  Future<bool> toggle(String itemId) async {
    final token = await ref.read(tokenStoreProvider).getAccessToken();
    if (token == null || token.isEmpty) return false;

    final current = {...(state.valueOrNull ?? <String>{})};
    final wasIn = current.contains(itemId);
    if (wasIn) {
      current.remove(itemId);
    } else {
      current.add(itemId);
    }
    state = AsyncData(current);

    try {
      final api = ref.read(apiClientProvider);
      if (wasIn) {
        await api.deleteData('/wishlist/$itemId', parse: (_) => null);
      } else {
        await api.postData(
          '/wishlist',
          body: {'itemId': itemId},
          parse: (_) => null,
        );
      }
      return true;
    } catch (_) {
      final reverted = {...(state.valueOrNull ?? <String>{})};
      if (wasIn) {
        reverted.add(itemId);
      } else {
        reverted.remove(itemId);
      }
      state = AsyncData(reverted);
      rethrow;
    }
  }
}
