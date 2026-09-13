import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/config/providers.dart';
import '../../shared/widgets/cached_image.dart';
import '../../shared/widgets/empty_error.dart';
import '../catalog/providers.dart';

/// Large-tap catalog for counter tablets (`FEATURE_STORE_MODE`).
class StoreModeScreen extends ConsumerWidget {
  const StoreModeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final flags = ref.watch(featuresProvider).valueOrNull;
    if (flags != null && !flags.storeMode) {
      return Scaffold(
        appBar: AppBar(title: const Text('Store mode')),
        body: const AppEmptyState(
          title: 'Not available',
          message: 'Store mode is not enabled for this shop.',
        ),
      );
    }

    final async = ref.watch(itemListProvider(const ItemListQuery()));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Store mode'),
        actions: [
          IconButton(
            tooltip: 'Exit',
            onPressed: () => context.go('/home'),
            icon: const Icon(Icons.close),
          ),
        ],
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(itemListProvider(const ItemListQuery())),
        ),
        data: (items) {
          if (items.isEmpty) {
            return const AppEmptyState(title: 'No items', message: 'Add active catalog items.');
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.72,
            ),
            itemCount: items.length,
            itemBuilder: (context, i) {
              final item = items[i];
              return InkWell(
                onTap: () => context.push('/items/${item.id}'),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Expanded(
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: AppCachedImage(
                          url: item.primaryImageUrl,
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      item.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                      Text(
                      '${item.sku} · ${item.purity}',
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                  ],
                ),
              );
            },
          );
        },
      ),
    );
  }
}
