class RateSnapshot {
  const RateSnapshot({
    required this.id,
    required this.effectiveAt,
    required this.gold24kPerGram,
    required this.gold22kPerGram,
    required this.gold18kPerGram,
    required this.silverPerGram,
    this.note,
    this.source,
  });

  final String id;
  final DateTime effectiveAt;
  final double gold24kPerGram;
  final double gold22kPerGram;
  final double gold18kPerGram;
  final double silverPerGram;
  final String? note;
  final String? source;

  bool get isLive => source == 'manual' || source == 'api';

  factory RateSnapshot.fromJson(Map<String, dynamic> json) {
    return RateSnapshot(
      id: json['id']?.toString() ?? '',
      effectiveAt: DateTime.tryParse(json['effectiveAt']?.toString() ?? '') ??
          DateTime.now(),
      gold24kPerGram: (json['gold24kPerGram'] as num?)?.toDouble() ?? 0,
      gold22kPerGram: (json['gold22kPerGram'] as num?)?.toDouble() ?? 0,
      gold18kPerGram: (json['gold18kPerGram'] as num?)?.toDouble() ?? 0,
      silverPerGram: (json['silverPerGram'] as num?)?.toDouble() ?? 0,
      note: json['note']?.toString(),
      source: json['source']?.toString(),
    );
  }
}

class CategoryDto {
  const CategoryDto({
    required this.id,
    required this.name,
    required this.slug,
    required this.coverImageUrl,
    required this.parentId,
    required this.sortOrder,
    required this.isActive,
    this.children = const [],
  });

  final String id;
  final String name;
  final String slug;
  final String coverImageUrl;
  final String? parentId;
  final int sortOrder;
  final bool isActive;
  final List<CategoryDto> children;

  factory CategoryDto.fromJson(Map<String, dynamic> json) {
    final kids = json['children'];
    return CategoryDto(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      coverImageUrl: json['coverImageUrl']?.toString() ?? '',
      parentId: json['parentId']?.toString(),
      sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] != false,
      children: kids is List
          ? kids
              .map((e) => CategoryDto.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList()
          : const [],
    );
  }
}

class ItemImage {
  const ItemImage({
    required this.url,
    required this.sortOrder,
    required this.isPrimary,
  });

  final String url;
  final int sortOrder;
  final bool isPrimary;

  factory ItemImage.fromJson(Map<String, dynamic> json) => ItemImage(
        url: json['url']?.toString() ?? '',
        sortOrder: (json['sortOrder'] as num?)?.toInt() ?? 0,
        isPrimary: json['isPrimary'] == true,
      );
}

class MakingCharge {
  const MakingCharge({required this.type, this.value});

  final String type;
  final double? value;

  factory MakingCharge.fromJson(Map<String, dynamic>? json) => MakingCharge(
        type: json?['type']?.toString() ?? 'inherit',
        value: (json?['value'] as num?)?.toDouble(),
      );
}

class ItemDto {
  const ItemDto({
    required this.id,
    required this.sku,
    required this.title,
    required this.description,
    required this.categoryId,
    required this.subcategoryId,
    required this.images,
    required this.metal,
    required this.purity,
    required this.huid,
    required this.hallmarkImageUrl,
    required this.grossWeightGrams,
    required this.netWeightGrams,
    required this.makingCharge,
    required this.stoneDetails,
    required this.sizeInfo,
    required this.tags,
    required this.isNewArrival,
    required this.isFeatured,
    required this.status,
  });

  final String id;
  final String sku;
  final String title;
  final String? description;
  final String categoryId;
  final String? subcategoryId;
  final List<ItemImage> images;
  final String metal;
  final String purity;
  final String? huid;
  final String? hallmarkImageUrl;
  final double? grossWeightGrams;
  final double? netWeightGrams;
  final MakingCharge makingCharge;
  final String? stoneDetails;
  final String? sizeInfo;
  final List<String> tags;
  final bool isNewArrival;
  final bool isFeatured;
  final String status;

  String get primaryImageUrl {
    if (images.isEmpty) return '';
    final primary = images.where((i) => i.isPrimary).toList();
    if (primary.isNotEmpty) return primary.first.url;
    final sorted = [...images]..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
    return sorted.first.url;
  }

  factory ItemDto.fromJson(Map<String, dynamic> json) {
    final imgs = json['images'];
    return ItemDto(
      id: json['id']?.toString() ?? '',
      sku: json['sku']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      categoryId: json['categoryId']?.toString() ?? '',
      subcategoryId: json['subcategoryId']?.toString(),
      images: imgs is List
          ? imgs
              .map((e) => ItemImage.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList()
          : const [],
      metal: json['metal']?.toString() ?? 'gold',
      purity: json['purity']?.toString() ?? '22K',
      huid: json['huid']?.toString(),
      hallmarkImageUrl: json['hallmarkImageUrl']?.toString(),
      grossWeightGrams: (json['grossWeightGrams'] as num?)?.toDouble(),
      netWeightGrams: (json['netWeightGrams'] as num?)?.toDouble(),
      makingCharge: MakingCharge.fromJson(
        json['makingCharge'] is Map
            ? Map<String, dynamic>.from(json['makingCharge'] as Map)
            : null,
      ),
      stoneDetails: json['stoneDetails']?.toString(),
      sizeInfo: json['sizeInfo']?.toString(),
      tags: (json['tags'] as List?)?.map((e) => e.toString()).toList() ?? const [],
      isNewArrival: json['isNewArrival'] == true,
      isFeatured: json['isFeatured'] == true,
      status: json['status']?.toString() ?? 'active',
    );
  }
}

class QuoteBreakup {
  const QuoteBreakup({
    required this.metalValue,
    required this.making,
    required this.taxable,
    required this.gst,
    required this.total,
  });

  final double metalValue;
  final double making;
  final double taxable;
  final double gst;
  final double total;

  factory QuoteBreakup.fromJson(Map<String, dynamic> json) => QuoteBreakup(
        metalValue: (json['metalValue'] as num?)?.toDouble() ?? 0,
        making: (json['making'] as num?)?.toDouble() ?? 0,
        taxable: (json['taxable'] as num?)?.toDouble() ?? 0,
        gst: (json['gst'] as num?)?.toDouble() ?? 0,
        total: (json['total'] as num?)?.toDouble() ?? 0,
      );
}

class QuoteResult {
  const QuoteResult({
    required this.purity,
    required this.weightGrams,
    required this.ratePerGram,
    required this.breakup,
  });

  final String purity;
  final double weightGrams;
  final double ratePerGram;
  final QuoteBreakup breakup;

  factory QuoteResult.fromJson(Map<String, dynamic> json) {
    final breakup = json['breakup'];
    return QuoteResult(
      purity: json['purity']?.toString() ?? '',
      weightGrams: (json['weightGrams'] as num?)?.toDouble() ?? 0,
      ratePerGram: (json['ratePerGram'] as num?)?.toDouble() ?? 0,
      breakup: QuoteBreakup.fromJson(
        Map<String, dynamic>.from(breakup as Map? ?? {}),
      ),
    );
  }
}

class ItemFilters {
  const ItemFilters({
    this.metal,
    this.purity,
    this.sort = 'newest',
    this.newOnly = false,
    this.featuredOnly = false,
  });

  final String? metal;
  final String? purity;
  final String sort;
  final bool newOnly;
  final bool featuredOnly;

  ItemFilters copyWith({
    String? metal,
    String? purity,
    String? sort,
    bool? newOnly,
    bool? featuredOnly,
    bool clearMetal = false,
    bool clearPurity = false,
  }) {
    return ItemFilters(
      metal: clearMetal ? null : (metal ?? this.metal),
      purity: clearPurity ? null : (purity ?? this.purity),
      sort: sort ?? this.sort,
      newOnly: newOnly ?? this.newOnly,
      featuredOnly: featuredOnly ?? this.featuredOnly,
    );
  }
}
