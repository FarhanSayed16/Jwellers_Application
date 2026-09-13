import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/providers.dart';
import '../../core/network/api_client.dart';

class ActiveScheme {
  const ActiveScheme({
    required this.id,
    required this.title,
    this.description,
    this.makingPercentOverride,
  });

  final String id;
  final String title;
  final String? description;
  final double? makingPercentOverride;

  factory ActiveScheme.fromJson(Map<String, dynamic> json) {
    final override = json['makingPercentOverride'];
    return ActiveScheme(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? 'Scheme',
      description: json['description']?.toString(),
      makingPercentOverride: override is num ? override.toDouble() : null,
    );
  }
}

/// Active festival schemes when `FEATURE_SCHEMES` is on.
final activeSchemesProvider = FutureProvider<List<ActiveScheme>>((ref) async {
  final flags = ref.watch(featuresProvider).valueOrNull;
  if (flags?.schemes != true) return const [];
  final api = ref.read(apiClientProvider);
  return api.getData(
    '/schemes/active',
    parse: (json) {
      final map = Map<String, dynamic>.from(json as Map);
      final list = map['schemes'] as List? ?? const [];
      return list
          .map((e) => ActiveScheme.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    },
  );
});
