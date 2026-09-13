import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../shared/widgets/empty_error.dart';
import '../catalog/models.dart';
import '../catalog/providers.dart';
import '../collection/item_grid_body.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  String _q = '';

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _controller,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Title, SKU, or tags',
            border: InputBorder.none,
          ),
          textInputAction: TextInputAction.search,
          onSubmitted: (value) => setState(() => _q = value.trim()),
        ),
        actions: [
          IconButton(
            onPressed: () => setState(() => _q = _controller.text.trim()),
            icon: const Icon(Icons.search),
          ),
        ],
      ),
      body: _q.isEmpty
          ? const AppEmptyState(
              title: 'Search the catalog',
              message: 'Try a product name, SKU, or tag.',
            )
          : ItemGridBody(
              query: ItemListQuery(q: _q, filters: const ItemFilters()),
            ),
    );
  }
}
