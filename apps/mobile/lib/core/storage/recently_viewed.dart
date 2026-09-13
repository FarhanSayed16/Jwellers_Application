import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../features/catalog/models.dart';

const _kRecentlyViewed = 'recently_viewed_items_v1';

class RecentlyViewedStore {
  Future<List<ItemDto>> list({int limit = 12}) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_kRecentlyViewed) ?? const [];
    final items = <ItemDto>[];
    for (final s in raw) {
      try {
        items.add(ItemDto.fromJson(Map<String, dynamic>.from(jsonDecode(s) as Map)));
      } catch (_) {}
    }
    return items.take(limit).toList();
  }

  Future<void> push(ItemDto item) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getStringList(_kRecentlyViewed) ?? <String>[];
    final next = <String>[
      jsonEncode({
        'id': item.id,
        'sku': item.sku,
        'title': item.title,
        'metal': item.metal,
        'purity': item.purity,
        'images': item.images
            .map((i) => {
                  'url': i.url,
                  'isPrimary': i.isPrimary,
                  'sortOrder': i.sortOrder,
                })
            .toList(),
        'netWeightGrams': item.netWeightGrams,
        'grossWeightGrams': item.grossWeightGrams,
        'isNewArrival': item.isNewArrival,
        'isFeatured': item.isFeatured,
        'huid': item.huid,
        'hallmarkImageUrl': item.hallmarkImageUrl,
        'categoryId': item.categoryId,
      }),
      ...raw.where((s) {
        try {
          final m = jsonDecode(s) as Map;
          return m['id']?.toString() != item.id;
        } catch (_) {
          return false;
        }
      }),
    ];
    await prefs.setStringList(_kRecentlyViewed, next.take(20).toList());
  }
}

final recentlyViewedStore = RecentlyViewedStore();
