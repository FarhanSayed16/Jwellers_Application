import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/api_client.dart';
import 'models.dart';

final catalogRepositoryProvider = Provider<CatalogRepository>(
  (ref) => CatalogRepository(ref.watch(apiClientProvider)),
);

class CatalogRepository {
  CatalogRepository(this._api);

  final ApiClient _api;

  Future<RateSnapshot?> fetchLatestRates() {
    return _api.getData(
      '/rates/latest',
      parse: (json) {
        final map = Map<String, dynamic>.from(json as Map);
        final rate = map['rate'];
        if (rate == null) return null;
        return RateSnapshot.fromJson(Map<String, dynamic>.from(rate as Map));
      },
    );
  }

  Future<List<RateSnapshot>> fetchRateHistory({int limit = 90}) {
    return _api.getData(
      '/rates/history',
      query: {'limit': limit},
      parse: (json) {
        final map = Map<String, dynamic>.from(json as Map);
        final points = map['points'] as List? ?? const [];
        return points
            .map((e) => RateSnapshot.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      },
    );
  }

  Future<List<CategoryDto>> fetchCategoryTree() {
    return _api.getData(
      '/categories',
      query: {'tree': 'true'},
      parse: (json) {
        final map = Map<String, dynamic>.from(json as Map);
        final tree = map['tree'] as List? ?? const [];
        return tree
            .map((e) => CategoryDto.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      },
    );
  }

  Future<CategoryDto> fetchCategory(String id) {
    return _api.getData(
      '/categories/$id',
      parse: (json) {
        final map = Map<String, dynamic>.from(json as Map);
        return CategoryDto.fromJson(
          Map<String, dynamic>.from(map['category'] as Map),
        );
      },
    );
  }

  Future<List<ItemDto>> fetchItems({
    String? categoryId,
    String? subcategoryId,
    String? q,
    String? purity,
    String? metal,
    bool? isNewArrival,
    bool? isFeatured,
    int limit = 40,
    int skip = 0,
  }) {
    return _api.getData(
      '/items',
      query: {
        'categoryId': ?categoryId,
        'subcategoryId': ?subcategoryId,
        if (q != null && q.isNotEmpty) 'q': q,
        'purity': ?purity,
        'metal': ?metal,
        if (isNewArrival == true) 'isNewArrival': 'true',
        if (isFeatured == true) 'isFeatured': 'true',
        'limit': limit,
        'skip': skip,
      },
      parse: (json) {
        final map = Map<String, dynamic>.from(json as Map);
        final items = map['items'] as List? ?? const [];
        return items
            .map((e) => ItemDto.fromJson(Map<String, dynamic>.from(e as Map)))
            .toList();
      },
    );
  }

  Future<ItemDto> fetchItem(String id) {
    return _api.getData(
      '/items/$id',
      parse: (json) {
        final map = Map<String, dynamic>.from(json as Map);
        return ItemDto.fromJson(Map<String, dynamic>.from(map['item'] as Map));
      },
    );
  }

  Future<ItemDto> fetchItemBySku(String sku) {
    return _api.getData(
      '/items/sku/${Uri.encodeComponent(sku)}',
      parse: (json) {
        final map = Map<String, dynamic>.from(json as Map);
        return ItemDto.fromJson(Map<String, dynamic>.from(map['item'] as Map));
      },
    );
  }

  Future<QuoteResult> quote({
    required String purity,
    required double weightGrams,
    required String makingType,
    required double makingValue,
    required double gstPercent,
  }) {
    return _api.postData(
      '/calculator/quote',
      body: {
        'purity': purity,
        'weightGrams': weightGrams,
        'makingType': makingType,
        'makingValue': makingValue,
        'gstPercent': gstPercent,
      },
      parse: (json) =>
          QuoteResult.fromJson(Map<String, dynamic>.from(json as Map)),
    );
  }
}

final latestRatesProvider =
    AsyncNotifierProvider<LatestRatesNotifier, RateSnapshot?>(
  LatestRatesNotifier.new,
);

class LatestRatesNotifier extends AsyncNotifier<RateSnapshot?> {
  @override
  Future<RateSnapshot?> build() =>
      ref.read(catalogRepositoryProvider).fetchLatestRates();

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(catalogRepositoryProvider).fetchLatestRates(),
    );
  }
}

final rateHistoryProvider =
    AsyncNotifierProvider<RateHistoryNotifier, List<RateSnapshot>>(
  RateHistoryNotifier.new,
);

class RateHistoryNotifier extends AsyncNotifier<List<RateSnapshot>> {
  @override
  Future<List<RateSnapshot>> build() =>
      ref.read(catalogRepositoryProvider).fetchRateHistory();

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(catalogRepositoryProvider).fetchRateHistory(),
    );
  }
}

final categoryTreeProvider =
    AsyncNotifierProvider<CategoryTreeNotifier, List<CategoryDto>>(
  CategoryTreeNotifier.new,
);

class CategoryTreeNotifier extends AsyncNotifier<List<CategoryDto>> {
  @override
  Future<List<CategoryDto>> build() =>
      ref.read(catalogRepositoryProvider).fetchCategoryTree();

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
      () => ref.read(catalogRepositoryProvider).fetchCategoryTree(),
    );
  }
}

class HomeFeed {
  const HomeFeed({
    required this.newArrivals,
    required this.featured,
    required this.categories,
  });

  final List<ItemDto> newArrivals;
  final List<ItemDto> featured;
  final List<CategoryDto> categories;
}

final homeFeedProvider =
    AsyncNotifierProvider<HomeFeedNotifier, HomeFeed>(HomeFeedNotifier.new);

class HomeFeedNotifier extends AsyncNotifier<HomeFeed> {
  @override
  Future<HomeFeed> build() => _load();

  Future<HomeFeed> _load() async {
    final repo = ref.read(catalogRepositoryProvider);
    final results = await Future.wait([
      repo.fetchItems(isNewArrival: true, limit: 12),
      repo.fetchItems(isFeatured: true, limit: 12),
      repo.fetchCategoryTree(),
    ]);
    return HomeFeed(
      newArrivals: results[0] as List<ItemDto>,
      featured: results[1] as List<ItemDto>,
      categories: results[2] as List<CategoryDto>,
    );
  }

  Future<void> reload() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(_load);
  }
}

final itemDetailProvider =
    FutureProvider.family<ItemDto, String>((ref, id) async {
  return ref.watch(catalogRepositoryProvider).fetchItem(id);
});

final itemBySkuProvider =
    FutureProvider.family<ItemDto, String>((ref, sku) async {
  return ref.watch(catalogRepositoryProvider).fetchItemBySku(sku);
});

class ItemListQuery {
  const ItemListQuery({
    this.categoryId,
    this.subcategoryId,
    this.q,
    this.filters = const ItemFilters(),
  });

  final String? categoryId;
  final String? subcategoryId;
  final String? q;
  final ItemFilters filters;

  @override
  bool operator ==(Object other) =>
      other is ItemListQuery &&
      other.categoryId == categoryId &&
      other.subcategoryId == subcategoryId &&
      other.q == q &&
      other.filters.metal == filters.metal &&
      other.filters.purity == filters.purity &&
      other.filters.sort == filters.sort &&
      other.filters.newOnly == filters.newOnly &&
      other.filters.featuredOnly == filters.featuredOnly;

  @override
  int get hashCode => Object.hash(
        categoryId,
        subcategoryId,
        q,
        filters.metal,
        filters.purity,
        filters.sort,
        filters.newOnly,
        filters.featuredOnly,
      );
}

final itemListProvider =
    FutureProvider.family<List<ItemDto>, ItemListQuery>((ref, query) async {
  final items = await ref.watch(catalogRepositoryProvider).fetchItems(
        categoryId: query.categoryId,
        subcategoryId: query.subcategoryId,
        q: query.q,
        metal: query.filters.metal,
        purity: query.filters.purity,
        isNewArrival: query.filters.newOnly ? true : null,
        isFeatured: query.filters.featuredOnly ? true : null,
        limit: 60,
      );
  final sorted = [...items];
  switch (query.filters.sort) {
    case 'title':
      sorted.sort((a, b) => a.title.compareTo(b.title));
    case 'sku':
      sorted.sort((a, b) => a.sku.compareTo(b.sku));
    default:
      break;
  }
  return sorted;
});
