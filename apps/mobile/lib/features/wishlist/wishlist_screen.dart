import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_client.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/cached_image.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../auth/models.dart';
import '../auth/soft_login_sheet.dart';
import 'wishlist_provider.dart';

final wishlistEntriesProvider =
    FutureProvider.autoDispose<List<WishlistEntry>>((ref) async {
  final customer = ref.watch(authProvider).valueOrNull;
  if (customer == null) return [];
  final data = await ref.read(apiClientProvider).getData<Map<String, dynamic>>(
        '/wishlist',
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
  final items = data['items'] as List? ?? const [];
  return items
      .map((e) => WishlistEntry.fromJson(Map<String, dynamic>.from(e as Map)))
      .toList();
});

class WishlistScreen extends ConsumerWidget {
  const WishlistScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider).valueOrNull;
    if (auth == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Wishlist')),
        body: AppEmptyState(
          title: 'Login to view wishlist',
          message: 'Save jewellery you love and find it here.',
          actionLabel: 'Login',
          onAction: () => showSoftLoginSheet(
            context,
            returnTo: '/wishlist',
            message: 'Login to view your wishlist.',
          ),
        ),
      );
    }

    final async = ref.watch(wishlistEntriesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Wishlist'),
        actions: [
          IconButton(
            onPressed: () {
              ref.invalidate(wishlistEntriesProvider);
              ref.read(wishlistIdsProvider.notifier).reload();
            },
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: async.when(
        loading: () => const AppSkeletonList(),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(wishlistEntriesProvider),
        ),
        data: (entries) {
          if (entries.isEmpty) {
            return const AppEmptyState(
              title: 'Wishlist is empty',
              message: 'Tap the heart on any item to save it here.',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: entries.length,
            separatorBuilder: (context, index) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final entry = entries[index];
              return ListTile(
                contentPadding: EdgeInsets.zero,
                leading: SizedBox(
                  width: 56,
                  height: 56,
                  child: AppCachedImage(
                    url: entry.primaryImageUrl,
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                title: Text(entry.title),
                subtitle: Text('${entry.sku} · ${entry.metal} ${entry.purity}'),
                trailing: IconButton(
                  icon: const Icon(Icons.favorite),
                  color: Theme.of(context).colorScheme.error,
                  onPressed: () async {
                    await ref
                        .read(wishlistIdsProvider.notifier)
                        .toggle(entry.itemId);
                    ref.invalidate(wishlistEntriesProvider);
                  },
                ),
                onTap: () => context.push('/items/${entry.itemId}'),
              );
            },
          );
        },
      ),
    );
  }
}
