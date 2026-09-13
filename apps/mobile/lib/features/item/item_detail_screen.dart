import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/providers.dart';
import '../../core/storage/recently_viewed.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/format.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/cached_image.dart';
import '../../shared/widgets/empty_error.dart';
import '../../shared/widgets/trust_strip.dart';
import '../auth/auth_provider.dart';
import '../auth/soft_login_sheet.dart';
import '../catalog/models.dart';
import '../catalog/providers.dart';
import '../chat/chat_providers.dart';
import '../enquiry/enquiry_screens.dart';
import '../wishlist/wishlist_provider.dart';

class ItemDetailScreen extends ConsumerWidget {
  const ItemDetailScreen({super.key, required this.itemId});

  final String itemId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(itemDetailProvider(itemId));
    final features = ref.watch(featuresProvider).valueOrNull;
    final config = ref.watch(publicConfigProvider).valueOrNull;
    final wishlisted =
        ref.watch(wishlistIdsProvider).valueOrNull?.contains(itemId) ?? false;

    return async.when(
      loading: () => Scaffold(
        appBar: AppBar(),
        body: const Padding(
          padding: EdgeInsets.all(16),
          child: AppSkeleton(height: 320, borderRadius: 12),
        ),
      ),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.invalidate(itemDetailProvider(itemId)),
        ),
      ),
      data: (item) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          recentlyViewedStore.push(item);
        });
        return Scaffold(
          appBar: AppBar(
            title: Text(item.sku),
            actions: [
              IconButton(
                onPressed: () async {
                  final ok =
                      await ref.read(wishlistIdsProvider.notifier).toggle(item.id);
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
                  color: wishlisted ? Theme.of(context).colorScheme.error : null,
                ),
              ),
            ],
          ),
          body: ListView(
            children: [
              _Gallery(images: item.images, fallback: item.primaryImageUrl),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.title,
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'SKU ${item.sku}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Theme.of(context)
                                .extension<AppTokens>()
                                ?.textSecondary,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _Chip(label: item.metal.toUpperCase()),
                        _Chip(label: item.purity),
                        if (item.netWeightGrams != null)
                          _Chip(label: '${item.netWeightGrams} g net'),
                        if (item.grossWeightGrams != null)
                          _Chip(label: '${item.grossWeightGrams} g gross'),
                      ],
                    ),
                    if (features?.hallmark == true &&
                        ((item.huid?.isNotEmpty ?? false) ||
                            (item.hallmarkImageUrl?.isNotEmpty ?? false))) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: Theme.of(context).dividerColor,
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.workspace_premium_outlined,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    item.huid?.isNotEmpty == true
                                        ? 'Hallmark · HUID ${item.huid}'
                                        : 'Hallmark stamp on file',
                                    style: Theme.of(context).textTheme.titleSmall,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Hallmark details as provided by the retailer. '
                              'Confirm HUID on the BIS Care app / portal before purchase.',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                            if (item.hallmarkImageUrl?.isNotEmpty == true) ...[
                              const SizedBox(height: 8),
                              AppCachedImage(
                                url: item.hallmarkImageUrl!,
                                height: 96,
                                width: 96,
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ],
                            const SizedBox(height: 8),
                            const TrustStrip(compact: true),
                          ],
                        ),
                      ),
                    ],
                    if (item.description?.isNotEmpty == true) ...[
                      const SizedBox(height: 16),
                      Text(item.description!),
                    ],
                    const SizedBox(height: 20),
                    _PriceBreakup(item: item),
                    if (features?.sizeGuide == true &&
                        item.sizeInfo?.isNotEmpty == true) ...[
                      const SizedBox(height: 8),
                      TextButton.icon(
                        onPressed: () => context.push('/size-guide'),
                        icon: const Icon(Icons.straighten),
                        label: const Text('Size guide'),
                      ),
                    ],
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: AppPrimaryButton(
                            label: 'Enquire',
                            onPressed: () => showEnquireSheet(
                              context,
                              ref,
                              itemId: item.id,
                              itemLabel: '${item.title} (${item.sku})',
                            ),
                          ),
                        ),
                        if (features?.chat == true) ...[
                          const SizedBox(width: 8),
                          Expanded(
                            child: AppSecondaryButton(
                              label: 'Chat',
                              onPressed: () async {
                                final customer =
                                    ref.read(authProvider).valueOrNull;
                                if (customer == null) {
                                  await showSoftLoginSheet(
                                    context,
                                    returnTo: '/items/${item.id}',
                                    message: 'Login to chat about this item.',
                                  );
                                  return;
                                }
                                try {
                                  final thread = await ref
                                      .read(chatThreadsProvider.notifier)
                                      .startThread(
                                        itemId: item.id,
                                        subject: item.sku,
                                      );
                                  if (context.mounted) {
                                    context.push('/chat/${thread.id}');
                                  }
                                } catch (e) {
                                  if (context.mounted) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(content: Text(e.toString())),
                                    );
                                  }
                                }
                              },
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (features?.whatsapp == true) ...[
                      const SizedBox(height: 8),
                      AppSecondaryButton(
                        label: 'WhatsApp',
                        onPressed: () async {
                          final phone = config?.socialWhatsapp ??
                              config?.contactPhone ??
                              '';
                          if (phone.isEmpty) return;
                          final digits = phone.replaceAll(RegExp(r'\D'), '');
                          final text = Uri.encodeComponent(
                            'Hi, I am interested in ${item.title} (${item.sku})',
                          );
                          final uri = Uri.parse(
                            'https://wa.me/$digits?text=$text',
                          );
                          if (await canLaunchUrl(uri)) {
                            await launchUrl(
                              uri,
                              mode: LaunchMode.externalApplication,
                            );
                          }
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _Gallery extends StatefulWidget {
  const _Gallery({required this.images, required this.fallback});

  final List<ItemImage> images;
  final String fallback;

  @override
  State<_Gallery> createState() => _GalleryState();
}

class _GalleryState extends State<_Gallery> {
  var _index = 0;

  @override
  Widget build(BuildContext context) {
    final urls = widget.images.map((e) => e.url).where((u) => u.isNotEmpty).toList();
    if (urls.isEmpty && widget.fallback.isNotEmpty) {
      urls.add(widget.fallback);
    }

    if (urls.isEmpty) {
      return AspectRatio(
        aspectRatio: 1,
        child: AppCachedImage(url: ''),
      );
    }

    return Column(
      children: [
        AspectRatio(
          aspectRatio: 1,
          child: PageView.builder(
            itemCount: urls.length,
            onPageChanged: (i) => setState(() => _index = i),
            itemBuilder: (context, index) => AppCachedImage(url: urls[index]),
          ),
        ),
        if (urls.length > 1)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text('${_index + 1} / ${urls.length}'),
          ),
      ],
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Chip(label: Text(label), visualDensity: VisualDensity.compact);
  }
}

class _PriceBreakup extends ConsumerWidget {
  const _PriceBreakup({required this.item});

  final ItemDto item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(publicConfigProvider).valueOrNull;
    final weight = item.netWeightGrams ?? item.grossWeightGrams;

    if (config == null) {
      return const AppSkeleton(height: 80);
    }
    if (weight == null || weight <= 0) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Theme.of(context).extension<AppTokens>()?.border ??
                Theme.of(context).dividerColor,
          ),
        ),
        child: Text(
          'Enquire for price',
          style: Theme.of(context).textTheme.titleMedium,
        ),
      );
    }

    final making = resolveMaking(item, config);
    final quoteAsync = ref.watch(
      _quoteProvider(
        (
          purity: quotePurityForItem(item),
          weight: weight,
          makingType: making.type,
          makingValue: making.value,
          gst: config.gstPercentDefault,
        ),
      ),
    );

    return quoteAsync.when(
      loading: () => const AppSkeleton(height: 120, borderRadius: 12),
      error: (e, _) => Text(
        'Could not estimate price. ${e.toString()}',
        style: Theme.of(context).textTheme.bodySmall,
      ),
      data: (quote) {
        final b = quote.breakup;
        return Container(
          width: double.infinity,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Theme.of(context).extension<AppTokens>()?.border ??
                  Theme.of(context).dividerColor,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Price estimate', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 8),
              _row(context, 'Metal', formatInr(b.metalValue, precise: true)),
              _row(context, 'Making', formatInr(b.making, precise: true)),
              _row(context, 'GST', formatInr(b.gst, precise: true)),
              const Divider(),
              _row(
                context,
                'Total',
                formatInr(b.total, precise: true),
                bold: true,
              ),
              const SizedBox(height: 4),
              Text(
                'Based on live rates · ${quote.ratePerGram.toStringAsFixed(2)}/g',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _row(BuildContext context, String label, String value, {bool bold = false}) {
    final style = bold
        ? Theme.of(context).textTheme.titleMedium
        : Theme.of(context).textTheme.bodyMedium;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Text(label, style: style),
          const Spacer(),
          Text(value, style: style),
        ],
      ),
    );
  }
}

typedef _QuoteArgs = ({
  String purity,
  double weight,
  String makingType,
  double makingValue,
  double gst,
});

final _quoteProvider = FutureProvider.family<QuoteResult, _QuoteArgs>((ref, args) {
  return ref.watch(catalogRepositoryProvider).quote(
        purity: args.purity,
        weightGrams: args.weight,
        makingType: args.makingType,
        makingValue: args.makingValue,
        gstPercent: args.gst,
      );
});
