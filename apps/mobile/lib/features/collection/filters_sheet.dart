import 'package:flutter/material.dart';

import '../catalog/models.dart';

Future<ItemFilters?> showItemFiltersSheet(
  BuildContext context,
  ItemFilters current,
) {
  return showModalBottomSheet<ItemFilters>(
    context: context,
    showDragHandle: true,
    isScrollControlled: true,
    builder: (context) => _FiltersSheet(initial: current),
  );
}

class _FiltersSheet extends StatefulWidget {
  const _FiltersSheet({required this.initial});

  final ItemFilters initial;

  @override
  State<_FiltersSheet> createState() => _FiltersSheetState();
}

class _FiltersSheetState extends State<_FiltersSheet> {
  late String? _metal = widget.initial.metal;
  late String? _purity = widget.initial.purity;
  late String _sort = widget.initial.sort;
  late bool _newOnly = widget.initial.newOnly;
  late bool _featuredOnly = widget.initial.featuredOnly;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 8,
        bottom: MediaQuery.paddingOf(context).bottom + 24,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Filters', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          Text('Metal', style: Theme.of(context).textTheme.titleSmall),
          Wrap(
            spacing: 8,
            children: [
              ChoiceChip(
                label: const Text('Any'),
                selected: _metal == null,
                onSelected: (_) => setState(() => _metal = null),
              ),
              for (final m in ['gold', 'silver', 'other'])
                ChoiceChip(
                  label: Text(m),
                  selected: _metal == m,
                  onSelected: (_) => setState(() => _metal = m),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text('Purity', style: Theme.of(context).textTheme.titleSmall),
          Wrap(
            spacing: 8,
            children: [
              ChoiceChip(
                label: const Text('Any'),
                selected: _purity == null,
                onSelected: (_) => setState(() => _purity = null),
              ),
              for (final p in ['24K', '22K', '18K', 'other'])
                ChoiceChip(
                  label: Text(p),
                  selected: _purity == p,
                  onSelected: (_) => setState(() => _purity = p),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Text('Collections', style: Theme.of(context).textTheme.titleSmall),
          Wrap(
            spacing: 8,
            children: [
              FilterChip(
                label: const Text('New arrivals'),
                selected: _newOnly,
                onSelected: (v) => setState(() => _newOnly = v),
              ),
              FilterChip(
                label: const Text('Featured'),
                selected: _featuredOnly,
                onSelected: (v) => setState(() => _featuredOnly = v),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text('Sort', style: Theme.of(context).textTheme.titleSmall),
          Wrap(
            spacing: 8,
            children: [
              for (final s in [
                ('newest', 'Newest'),
                ('title', 'Title'),
                ('sku', 'SKU'),
              ])
                ChoiceChip(
                  label: Text(s.$2),
                  selected: _sort == s.$1,
                  onSelected: (_) => setState(() => _sort = s.$1),
                ),
            ],
          ),
          const SizedBox(height: 20),
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop(
                ItemFilters(
                  metal: _metal,
                  purity: _purity,
                  sort: _sort,
                  newOnly: _newOnly,
                  featuredOnly: _featuredOnly,
                ),
              );
            },
            child: const Text('Apply'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop(const ItemFilters());
            },
            child: const Text('Clear'),
          ),
        ],
      ),
    );
  }
}
