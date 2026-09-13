import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/empty_error.dart';
import '../../shared/widgets/item_card.dart';
import '../catalog/models.dart';
import '../catalog/providers.dart';
import 'filters_sheet.dart';
import 'item_grid_body.dart';

class CollectionScreen extends ConsumerWidget {
  const CollectionScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tree = ref.watch(categoryTreeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Collection'),
        actions: [
          IconButton(
            tooltip: 'Search',
            onPressed: () => context.push('/search'),
            icon: const Icon(Icons.search),
          ),
        ],
      ),
      body: tree.when(
        loading: () => const AppSkeletonList(),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.read(categoryTreeProvider.notifier).reload(),
        ),
        data: (categories) {
          if (categories.isEmpty) {
            return const AppEmptyState(
              title: 'No categories yet',
              message: 'Categories created in Admin appear here.',
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 16,
              crossAxisSpacing: 16,
              childAspectRatio: 0.85,
            ),
            itemCount: categories.length,
            itemBuilder: (context, index) {
              final cat = categories[index];
              return CategoryCard(
                category: cat,
                onTap: () => context.push('/collection/${cat.id}'),
              );
            },
          );
        },
      ),
    );
  }
}

/// `/collection/:categoryId` — subcategories or item grid if leaf.
class CategoryBrowseScreen extends ConsumerWidget {
  const CategoryBrowseScreen({super.key, required this.categoryId});

  final String categoryId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tree = ref.watch(categoryTreeProvider);

    return tree.when(
      loading: () => Scaffold(
        appBar: AppBar(),
        body: const AppSkeletonList(),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.read(categoryTreeProvider.notifier).reload(),
        ),
      ),
      data: (categories) {
        final node = _findCategory(categories, categoryId);
        if (node == null) {
          return Scaffold(
            appBar: AppBar(title: const Text('Category')),
            body: const AppEmptyState(title: 'Category not found'),
          );
        }

        if (node.children.isNotEmpty) {
          return Scaffold(
            appBar: AppBar(
              title: Text(node.name),
              actions: [
                IconButton(
                  onPressed: () => context.push('/search'),
                  icon: const Icon(Icons.search),
                ),
              ],
            ),
            body: GridView.builder(
              padding: const EdgeInsets.all(16),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 16,
                crossAxisSpacing: 16,
                childAspectRatio: 0.85,
              ),
              itemCount: node.children.length,
              itemBuilder: (context, index) {
                final sub = node.children[index];
                return CategoryCard(
                  category: sub,
                  onTap: () =>
                      context.push('/collection/${node.id}/${sub.id}'),
                );
              },
            ),
          );
        }

        return ItemGridScreen(
          title: node.name,
          categoryId: node.id,
        );
      },
    );
  }
}

CategoryDto? _findCategory(List<CategoryDto> roots, String id) {
  for (final c in roots) {
    if (c.id == id) return c;
    final nested = _findCategory(c.children, id);
    if (nested != null) return nested;
  }
  return null;
}

class ItemGridScreen extends ConsumerStatefulWidget {
  const ItemGridScreen({
    super.key,
    required this.title,
    this.categoryId,
    this.subcategoryId,
  });

  final String title;
  final String? categoryId;
  final String? subcategoryId;

  @override
  ConsumerState<ItemGridScreen> createState() => _ItemGridScreenState();
}

class _ItemGridScreenState extends ConsumerState<ItemGridScreen> {
  ItemFilters _filters = const ItemFilters();

  @override
  Widget build(BuildContext context) {
    final query = ItemListQuery(
      categoryId: widget.categoryId,
      subcategoryId: widget.subcategoryId,
      filters: _filters,
    );

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        actions: [
          IconButton(
            tooltip: 'Filter',
            onPressed: () async {
              final next = await showItemFiltersSheet(context, _filters);
              if (next != null && mounted) setState(() => _filters = next);
            },
            icon: const Icon(Icons.tune),
          ),
          IconButton(
            tooltip: 'Search',
            onPressed: () => context.push('/search'),
            icon: const Icon(Icons.search),
          ),
        ],
      ),
      body: ItemGridBody(query: query),
    );
  }
}
