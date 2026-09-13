import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_theme.dart';
import '../../features/auth/soft_login_sheet.dart';
import '../../features/catalog/models.dart';
import '../../features/wishlist/wishlist_provider.dart';
import 'cached_image.dart';

class ItemCard extends ConsumerWidget {
  const ItemCard({
    super.key,
    required this.item,
    this.width = 148,
  });

  final ItemDto item;
  final double width;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final wishlisted =
        ref.watch(wishlistIdsProvider).valueOrNull?.contains(item.id) ?? false;
    final tokens = Theme.of(context).extension<AppTokens>();

    return SizedBox(
      width: width,
      child: InkWell(
        onTap: () => context.push('/items/${item.id}'),
        borderRadius: BorderRadius.circular(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            AspectRatio(
              aspectRatio: 1,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  AppCachedImage(
                    url: item.primaryImageUrl,
                    borderRadius: BorderRadius.circular(12),
                    thumb: true,
                    thumbWidth: 480,
                  ),
                  Positioned(
                    top: 4,
                    right: 4,
                    child: Material(
                      color: Theme.of(context)
                          .colorScheme
                          .surface
                          .withValues(alpha: 0.9),
                      shape: const CircleBorder(),
                      child: IconButton(
                        visualDensity: VisualDensity.compact,
                        tooltip: 'Wishlist',
                        onPressed: () async {
                          final ok = await ref
                              .read(wishlistIdsProvider.notifier)
                              .toggle(item.id);
                          if (!context.mounted) return;
                          if (!ok) {
                            await showSoftLoginSheet(
                              context,
                              returnTo: '/items/${item.id}',
                            );
                          }
                        },
                        icon: Icon(
                          wishlisted ? Icons.favorite : Icons.favorite_border,
                          color: wishlisted
                              ? Theme.of(context).colorScheme.error
                              : tokens?.textSecondary,
                          size: 20,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              item.title,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: Theme.of(context).textTheme.titleSmall,
            ),
            Text(
              item.sku,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: tokens?.textSecondary,
                  ),
            ),
          ],
        ),
      ),
    );
  }
}

class CategoryCard extends StatelessWidget {
  const CategoryCard({
    super.key,
    required this.category,
    required this.onTap,
  });

  final CategoryDto category;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: AppCachedImage(
              url: category.coverImageUrl,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            category.name,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: Theme.of(context).textTheme.titleSmall,
          ),
        ],
      ),
    );
  }
}
