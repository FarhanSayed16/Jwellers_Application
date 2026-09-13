import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/empty_error.dart';
import '../../shared/widgets/item_card.dart';
import '../catalog/providers.dart';

class ItemGridBody extends ConsumerWidget {
  const ItemGridBody({super.key, required this.query});

  final ItemListQuery query;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(itemListProvider(query));

    return async.when(
      loading: () => const AppSkeletonList(),
      error: (e, _) => AppErrorRetry(
        message: e.toString(),
        onRetry: () => ref.invalidate(itemListProvider(query)),
      ),
      data: (items) {
        if (items.isEmpty) {
          return const AppEmptyState(
            title: 'No items',
            message: 'Try clearing filters or pick another category.',
          );
        }
        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            mainAxisSpacing: 16,
            crossAxisSpacing: 12,
            childAspectRatio: 0.62,
          ),
          itemCount: items.length,
          itemBuilder: (context, index) => ItemCard(
            item: items[index],
            width: double.infinity,
          ),
        );
      },
    );
  }
}
