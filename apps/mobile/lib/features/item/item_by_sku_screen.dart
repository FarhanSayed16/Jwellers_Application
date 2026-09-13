import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/empty_error.dart';
import '../catalog/providers.dart';
import 'item_detail_screen.dart';

/// Resolves `/items/sku/:sku` deep links to the same detail UI as `/items/:id`.
class ItemBySkuScreen extends ConsumerWidget {
  const ItemBySkuScreen({super.key, required this.sku});

  final String sku;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(itemBySkuProvider(sku));
    return async.when(
      loading: () => Scaffold(
        appBar: AppBar(title: Text(sku)),
        body: const Padding(
          padding: EdgeInsets.all(16),
          child: AppSkeleton(height: 320, borderRadius: 12),
        ),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(title: Text(sku)),
        body: AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(itemBySkuProvider(sku)),
        ),
      ),
      data: (item) => ItemDetailScreen(itemId: item.id),
    );
  }
}
