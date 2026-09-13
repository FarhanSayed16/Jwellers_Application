import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/network/api_client.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/cached_image.dart';
import '../../shared/widgets/empty_error.dart';

class OfferDto {
  const OfferDto({
    required this.id,
    required this.title,
    this.description,
    this.bannerImageUrl,
    this.validFrom,
    this.validTill,
  });

  final String id;
  final String title;
  final String? description;
  final String? bannerImageUrl;
  final DateTime? validFrom;
  final DateTime? validTill;

  factory OfferDto.fromJson(Map<String, dynamic> json) {
    DateTime? parse(String? s) => s == null || s.isEmpty ? null : DateTime.tryParse(s);
    return OfferDto(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      bannerImageUrl: json['bannerImageUrl']?.toString(),
      validFrom: parse(json['validFrom']?.toString()),
      validTill: parse(json['validTill']?.toString()),
    );
  }
}

final offersProvider = FutureProvider.autoDispose<List<OfferDto>>((ref) async {
  return ref.watch(apiClientProvider).getData(
    '/offers',
    parse: (json) {
      final map = Map<String, dynamic>.from(json as Map);
      final list = map['offers'] as List? ?? const [];
      return list
          .map((e) => OfferDto.fromJson(Map<String, dynamic>.from(e as Map)))
          .toList();
    },
  );
});

class OffersScreen extends ConsumerWidget {
  const OffersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(offersProvider);
    final fmt = DateFormat.yMMMd();

    return Scaffold(
      appBar: AppBar(title: const Text('Offers')),
      body: async.when(
        loading: () => const Padding(
          padding: EdgeInsets.all(16),
          child: AppSkeleton(height: 120, borderRadius: 12),
        ),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(offersProvider),
        ),
        data: (offers) {
          if (offers.isEmpty) {
            return const AppEmptyState(
              title: 'No offers right now',
              message: 'Check back soon for seasonal promotions.',
            );
          }
          return RefreshIndicator(
            onRefresh: () async => ref.invalidate(offersProvider),
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: offers.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, i) {
                final o = offers[i];
                return Card(
                  clipBehavior: Clip.antiAlias,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (o.bannerImageUrl != null && o.bannerImageUrl!.isNotEmpty)
                        AppCachedImage(
                          url: o.bannerImageUrl!,
                          height: 140,
                          width: double.infinity,
                          fit: BoxFit.cover,
                        ),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              o.title,
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            if (o.description?.isNotEmpty == true) ...[
                              const SizedBox(height: 8),
                              Text(o.description!),
                            ],
                            if (o.validFrom != null || o.validTill != null) ...[
                              const SizedBox(height: 8),
                              Text(
                                [
                                  if (o.validFrom != null)
                                    'From ${fmt.format(o.validFrom!.toLocal())}',
                                  if (o.validTill != null)
                                    'Till ${fmt.format(o.validTill!.toLocal())}',
                                ].join(' · '),
                                style: Theme.of(context).textTheme.bodySmall,
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
