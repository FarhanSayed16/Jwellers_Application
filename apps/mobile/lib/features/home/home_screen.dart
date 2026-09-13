import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:share_plus/share_plus.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/providers.dart';
import '../../core/flavor/flavor_config.dart';
import '../../core/network/api_client.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/format.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/cached_image.dart';
import '../../shared/widgets/empty_error.dart';
import '../../shared/widgets/item_card.dart';
import '../../shared/widgets/trust_strip.dart';
import '../../core/storage/recently_viewed.dart';
import '../catalog/models.dart';
import '../catalog/providers.dart';
import '../schemes/schemes_provider.dart';

class _BoardRow {
  const _BoardRow({required this.title, required this.items});
  final String title;
  final List<ItemDto> items;
}

final curatedBoardsProvider = FutureProvider<List<_BoardRow>>((ref) async {
  final flags = ref.watch(featuresProvider).valueOrNull;
  if (flags?.curatedBoards != true) return const [];
  final api = ref.read(apiClientProvider);
  return api.getData(
    '/boards',
    parse: (json) {
      final map = Map<String, dynamic>.from(json as Map);
      final boards = map['boards'] as List? ?? const [];
      return boards.map((b) {
        final m = Map<String, dynamic>.from(b as Map);
        final items = (m['items'] as List? ?? const [])
            .map((e) {
              final row = Map<String, dynamic>.from(e as Map);
              // Public board items are slim — coerce into ItemDto shape
              return ItemDto.fromJson({
                'id': row['id'],
                'sku': row['sku'],
                'title': row['title'],
                'purity': row['purity'] ?? '22K',
                'metal': row['metal'] ?? 'gold',
                'images': row['primaryImageUrl'] != null
                    ? [
                        {'url': row['primaryImageUrl'], 'isPrimary': true},
                      ]
                    : [],
                'status': 'active',
              });
            })
            .toList();
        return _BoardRow(title: m['title']?.toString() ?? 'Board', items: items);
      }).toList();
    },
  );
});

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  bool _gold = true;

  Future<void> _refresh() async {
    await Future.wait([
      ref.read(latestRatesProvider.notifier).reload(),
      ref.read(homeFeedProvider.notifier).reload(),
    ]);
  }

  Future<void> _callShop(String phone) async {
    final uri = Uri(scheme: 'tel', path: phone);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  @override
  Widget build(BuildContext context) {
    final config = ref.watch(publicConfigProvider).valueOrNull;
    final ratesAsync = ref.watch(latestRatesProvider);
    final feedAsync = ref.watch(homeFeedProvider);
    final tokens = Theme.of(context).extension<AppTokens>();
    final shopName = config?.shopName ?? FlavorConfig.instance.appName;

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        title: Row(
          children: [
            if (config?.logoUrl.isNotEmpty == true)
              Padding(
                padding: const EdgeInsets.only(right: 10),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: AppCachedImage(
                    url: config!.logoUrl,
                    width: 32,
                    height: 32,
                  ),
                ),
              ),
            Flexible(
              child: Text(shopName, overflow: TextOverflow.ellipsis),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Call',
            onPressed: () {
              final phone = config?.contactPhone;
              if (phone != null && phone.isNotEmpty) _callShop(phone);
            },
            icon: const Icon(Icons.call_outlined),
          ),
          IconButton(
            tooltip: 'Notifications',
            onPressed: () => context.push('/notifications/prime'),
            icon: const Icon(Icons.notifications_none),
          ),
          IconButton(
            tooltip: 'Account',
            onPressed: () => context.push('/account'),
            icon: const Icon(Icons.person_outline),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    _HeroBanner(shopName: shopName),
                    const SizedBox(height: 12),
                    const TrustStrip(compact: true),
                    const SizedBox(height: 12),
                    if (ref.watch(featuresProvider).valueOrNull?.schemes == true)
                      ref.watch(activeSchemesProvider).when(
                            loading: () => const SizedBox.shrink(),
                            error: (error, stack) => const SizedBox.shrink(),
                            data: (schemes) {
                              if (schemes.isEmpty) return const SizedBox.shrink();
                              return Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Align(
                                  alignment: Alignment.centerLeft,
                                  child: ActionChip(
                                    avatar: const Icon(Icons.local_offer_outlined, size: 18),
                                    label: Text(
                                      schemes.length == 1
                                          ? schemes.first.title
                                          : '${schemes.length} active schemes',
                                    ),
                                    onPressed: () => context.go('/calculator'),
                                  ),
                                ),
                              );
                            },
                          ),
                    InkWell(
                      onTap: () => context.push('/search'),
                      borderRadius: BorderRadius.circular(12),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 14,
                        ),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: tokens?.border ??
                                Theme.of(context).dividerColor,
                          ),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.search,
                              color: tokens?.textSecondary,
                            ),
                            const SizedBox(width: 10),
                            Text(
                              'Search jewellery, SKU, tags…',
                              style: Theme.of(context)
                                  .textTheme
                                  .bodyMedium
                                  ?.copyWith(color: tokens?.textSecondary),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    ratesAsync.when(
                      loading: () => const AppSkeleton(height: 140, borderRadius: 12),
                      error: (e, _) => AppErrorRetry(
                        message: e.toString(),
                        onRetry: () =>
                            ref.read(latestRatesProvider.notifier).reload(),
                      ),
                      data: (rate) => _RatesSection(
                        rate: rate,
                        gold: _gold,
                        onToggle: (gold) => setState(() => _gold = gold),
                      ),
                    ),
                    if (ref.watch(featuresProvider).valueOrNull?.curatedBoards ==
                        true)
                      ref.watch(curatedBoardsProvider).when(
                            loading: () => const Padding(
                              padding: EdgeInsets.only(top: 12),
                              child: AppSkeleton(height: 180, borderRadius: 12),
                            ),
                            error: (error, stack) => const SizedBox.shrink(),
                            data: (boards) {
                              if (boards.isEmpty) return const SizedBox.shrink();
                              return Column(
                                children: [
                                  for (final board in boards) ...[
                                    const SizedBox(height: 16),
                                    Align(
                                      alignment: Alignment.centerLeft,
                                      child: Text(
                                        board.title,
                                        style: Theme.of(context)
                                            .textTheme
                                            .titleMedium,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    SizedBox(
                                      height: 210,
                                      child: ListView.separated(
                                        scrollDirection: Axis.horizontal,
                                        itemCount: board.items.length,
                                        separatorBuilder: (context, index) =>
                                            const SizedBox(width: 10),
                                        itemBuilder: (context, i) {
                                          return ItemCard(
                                            item: board.items[i],
                                            width: 150,
                                          );
                                        },
                                      ),
                                    ),
                                  ],
                                ],
                              );
                            },
                          ),
                    if (ref.watch(featuresProvider).valueOrNull?.offers ==
                        true) ...[
                      const SizedBox(height: 12),
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: const Icon(Icons.local_offer_outlined),
                        title: const Text('Current offers'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => context.push('/offers'),
                      ),
                    ],
                    const SizedBox(height: 8),
                    FutureBuilder(
                      future: recentlyViewedStore.list(limit: 8),
                      builder: (context, snap) {
                        final items = snap.data ?? const <ItemDto>[];
                        if (items.isEmpty) return const SizedBox.shrink();
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Recently viewed',
                              style: Theme.of(context).textTheme.titleMedium,
                            ),
                            const SizedBox(height: 8),
                            SizedBox(
                              height: 210,
                              child: ListView.separated(
                                scrollDirection: Axis.horizontal,
                                itemCount: items.length,
                                separatorBuilder: (context, index) =>
                                    const SizedBox(width: 10),
                                itemBuilder: (context, i) {
                                  final item = items[i];
                                  return ItemCard(item: item, width: 150);
                                },
                              ),
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: feedAsync.when(
                loading: () => const Padding(
                  padding: EdgeInsets.all(16),
                  child: AppSkeleton(height: 180, borderRadius: 12),
                ),
                error: (e, _) => Padding(
                  padding: const EdgeInsets.all(16),
                  child: AppErrorRetry(
                    message: e.toString(),
                    onRetry: () => ref.read(homeFeedProvider.notifier).reload(),
                  ),
                ),
                data: (feed) => _HomeRows(feed: feed),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 32)),
          ],
        ),
      ),
    );
  }
}

class _HeroBanner extends StatelessWidget {
  const _HeroBanner({required this.shopName});

  final String shopName;

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return Container(
      height: 140,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        gradient: LinearGradient(
          colors: [
            primary,
            primary.withValues(alpha: 0.75),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.all(20),
      alignment: Alignment.bottomLeft,
      child: Text(
        'Crafted for moments that last\n$shopName',
        style: Theme.of(context).textTheme.titleLarge?.copyWith(
              color: Theme.of(context).colorScheme.onPrimary,
            ),
      ),
    );
  }
}

class _RatesSection extends ConsumerWidget {
  const _RatesSection({
    required this.rate,
    required this.gold,
    required this.onToggle,
  });

  final RateSnapshot? rate;
  final bool gold;
  final ValueChanged<bool> onToggle;

  Future<void> _shareCard(WidgetRef ref) async {
    final api = ref.read(apiClientProvider);
    final data = await api.getData<Map<String, dynamic>>(
      '/rates/share-card',
      parse: (json) => Map<String, dynamic>.from(json as Map),
    );
    final card = Map<String, dynamic>.from(data['card'] as Map? ?? {});
    final text = card['shareText']?.toString() ?? 'Today’s rates';
    await SharePlus.instance.share(ShareParams(text: text));
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (rate == null) {
      return AppEmptyState(
        title: 'Rates unavailable',
        message: 'Ask the shop to publish today’s gold & silver rates.',
      );
    }

    final cards = gold
        ? [
            ('24K', rate!.gold24kPerGram),
            ('22K', rate!.gold22kPerGram),
            ('18K', rate!.gold18kPerGram),
          ]
        : [
            ('Silver', rate!.silverPerGram),
          ];
    final canShare =
        ref.watch(featuresProvider).valueOrNull?.shareRateCard == true;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text('Today’s rates', style: Theme.of(context).textTheme.titleMedium),
            const Spacer(),
            if (rate!.isLive)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  'Live',
                  style: Theme.of(context).textTheme.labelSmall?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              ),
            if (canShare)
              IconButton(
                tooltip: 'Share rate card',
                onPressed: () => _shareCard(ref),
                icon: const Icon(Icons.share_outlined),
              ),
            TextButton(
              onPressed: () => context.push('/rates/history'),
              child: const Text('History'),
            ),
          ],
        ),
        SegmentedButton<bool>(
          segments: const [
            ButtonSegment(value: true, label: Text('Gold')),
            ButtonSegment(value: false, label: Text('Silver')),
          ],
          selected: {gold},
          onSelectionChanged: (s) => onToggle(s.first),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            for (final c in cards)
              _RateCard(label: c.$1, value: formatInr(c.$2, precise: true)),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          'Updated ${formatRateTime(rate!.effectiveAt)} · per gram',
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }
}

class _RateCard extends StatelessWidget {
  const _RateCard({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 110,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Theme.of(context).extension<AppTokens>()?.border ??
              Theme.of(context).dividerColor,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 6),
          Text(value, style: Theme.of(context).textTheme.titleMedium),
        ],
      ),
    );
  }
}

class _HomeRows extends StatelessWidget {
  const _HomeRows({required this.feed});

  final HomeFeed feed;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (feed.newArrivals.isNotEmpty)
          _ItemRow(title: 'New arrivals', items: feed.newArrivals),
        if (feed.featured.isNotEmpty)
          _ItemRow(title: 'Featured', items: feed.featured),
        if (feed.categories.isNotEmpty) ...[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
            child: Row(
              children: [
                Text(
                  'Shop by category',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const Spacer(),
                TextButton(
                  onPressed: () => context.go('/collection'),
                  child: const Text('See all'),
                ),
              ],
            ),
          ),
          SizedBox(
            height: 140,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              scrollDirection: Axis.horizontal,
              itemCount: feed.categories.length.clamp(0, 8),
              separatorBuilder: (context, index) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final cat = feed.categories[index];
                return SizedBox(
                  width: 110,
                  child: CategoryCard(
                    category: cat,
                    onTap: () => context.push('/collection/${cat.id}'),
                  ),
                );
              },
            ),
          ),
        ],
        if (feed.newArrivals.isEmpty &&
            feed.featured.isEmpty &&
            feed.categories.isEmpty)
          const Padding(
            padding: EdgeInsets.all(24),
            child: AppEmptyState(
              title: 'Catalog empty',
              message:
                  'Add categories and items in Admin to browse them here.',
            ),
          ),
      ],
    );
  }
}

class _ItemRow extends StatelessWidget {
  const _ItemRow({required this.title, required this.items});

  final String title;
  final List<ItemDto> items;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
          child: Text(title, style: Theme.of(context).textTheme.titleMedium),
        ),
        SizedBox(
          height: 220,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: items.length,
            separatorBuilder: (context, index) => const SizedBox(width: 12),
            itemBuilder: (context, index) => ItemCard(item: items[index]),
          ),
        ),
      ],
    );
  }
}
