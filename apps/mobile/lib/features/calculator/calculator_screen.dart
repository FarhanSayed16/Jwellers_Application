import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/providers.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/format.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/empty_error.dart';
import '../catalog/models.dart';
import '../catalog/providers.dart';
import '../schemes/schemes_provider.dart';

class CalculatorScreen extends ConsumerStatefulWidget {
  const CalculatorScreen({super.key});

  @override
  ConsumerState<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends ConsumerState<CalculatorScreen> {
  String _purity = '22k';
  final _weightCtrl = TextEditingController(text: '10.000');
  final _makingCtrl = TextEditingController();
  final _gstCtrl = TextEditingController();
  QuoteResult? _quote;
  Object? _error;
  bool _loading = false;
  bool _seededDefaults = false;
  String? _schemeTitle;

  @override
  void dispose() {
    _weightCtrl.dispose();
    _makingCtrl.dispose();
    _gstCtrl.dispose();
    super.dispose();
  }

  void _seedDefaults() {
    if (_seededDefaults) return;
    final config = ref.read(publicConfigProvider).valueOrNull;
    if (config == null) return;
    _makingCtrl.text = config.makingChargeDefault.value.toString();
    _gstCtrl.text = config.gstPercentDefault.toString();
    _seededDefaults = true;

    // Apply festival scheme making override after seed (if present).
    final schemes = ref.read(activeSchemesProvider).valueOrNull;
    if (schemes != null && schemes.isNotEmpty) {
      final scheme = schemes.firstWhere(
        (s) => s.makingPercentOverride != null,
        orElse: () => schemes.first,
      );
      if (scheme.makingPercentOverride != null) {
        _makingCtrl.text = scheme.makingPercentOverride!.toString();
        _schemeTitle = scheme.title;
      }
    }
  }

  void _reset() {
    final config = ref.read(publicConfigProvider).valueOrNull;
    setState(() {
      _purity = '22k';
      _weightCtrl.text = '10.000';
      _makingCtrl.text = (config?.makingChargeDefault.value ?? 12).toString();
      _gstCtrl.text = (config?.gstPercentDefault ?? 3).toString();
      _quote = null;
      _error = null;
    });
  }

  Future<void> _calculate() async {
    final weight = double.tryParse(_weightCtrl.text.trim());
    final making = double.tryParse(_makingCtrl.text.trim());
    final gst = double.tryParse(_gstCtrl.text.trim());
    if (weight == null || weight <= 0) {
      setState(() => _error = 'Enter a valid weight in grams.');
      return;
    }
    if (making == null || making < 0 || gst == null || gst < 0) {
      setState(() => _error = 'Making and GST must be non-negative numbers.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final config = ref.read(publicConfigProvider).valueOrNull;
      final makingType =
          config?.makingChargeDefault.type == 'flat' ? 'flat' : 'percent';
      final quote = await ref.read(catalogRepositoryProvider).quote(
            purity: _purity,
            weightGrams: weight,
            makingType: makingType,
            makingValue: making,
            gstPercent: gst,
          );
      if (!mounted) return;
      setState(() {
        _quote = quote;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e;
        _quote = null;
        _loading = false;
      });
    }
  }

  Future<void> _shareWhatsApp() async {
    final quote = _quote;
    if (quote == null) return;
    final config = ref.read(publicConfigProvider).valueOrNull;
    final phone = config?.socialWhatsapp ?? config?.contactPhone ?? '';
    final text = Uri.encodeComponent(
      'Price estimate (${quote.purity.toUpperCase()}, ${quote.weightGrams}g):\n'
      'Metal ${formatInr(quote.breakup.metalValue, precise: true)}\n'
      'Making ${formatInr(quote.breakup.making, precise: true)}\n'
      'GST ${formatInr(quote.breakup.gst, precise: true)}\n'
      'Total ${formatInr(quote.breakup.total, precise: true)}',
    );
    final uri = phone.isEmpty
        ? Uri.parse('https://wa.me/?text=$text')
        : Uri.parse(
            'https://wa.me/${phone.replaceAll(RegExp(r'\D'), '')}?text=$text',
          );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  @override
  Widget build(BuildContext context) {
    _seedDefaults();
    // Re-apply scheme once schemes load after first seed.
    final schemesAsync = ref.watch(activeSchemesProvider);
    schemesAsync.whenData((schemes) {
      if (!_seededDefaults || _schemeTitle != null || schemes.isEmpty) return;
      final scheme = schemes.firstWhere(
        (s) => s.makingPercentOverride != null,
        orElse: () => schemes.first,
      );
      if (scheme.makingPercentOverride != null) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted || _schemeTitle != null) return;
          setState(() {
            _makingCtrl.text = scheme.makingPercentOverride!.toString();
            _schemeTitle = scheme.title;
          });
        });
      }
    });

    final ratesAsync = ref.watch(latestRatesProvider);
    final features = ref.watch(featuresProvider).valueOrNull;
    final tokens = Theme.of(context).extension<AppTokens>();
    final showHistory = features?.rateHistory != false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Calculator'),
        actions: [
          if (features?.oldGoldExchange == true)
            IconButton(
              tooltip: 'Old-gold exchange',
              onPressed: () => context.push('/old-gold'),
              icon: const Icon(Icons.scale_outlined),
            ),
          if (showHistory)
            IconButton(
              tooltip: 'Rate history',
              onPressed: () => context.push('/rates/history'),
              icon: const Icon(Icons.show_chart),
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_schemeTitle != null) ...[
            Material(
              color: Theme.of(context).colorScheme.secondaryContainer,
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                child: Text(
                  'Scheme: $_schemeTitle — making % applied',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          if (features?.oldGoldExchange == true) ...[
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () => context.push('/old-gold'),
                icon: const Icon(Icons.scale_outlined, size: 18),
                label: const Text('Estimate old-gold exchange'),
              ),
            ),
            const SizedBox(height: 8),
          ],
          ratesAsync.when(
            loading: () => const AppSkeleton(height: 88, borderRadius: 12),
            error: (e, _) => AppErrorRetry(
              message: e.toString(),
              onRetry: () => ref.read(latestRatesProvider.notifier).reload(),
            ),
            data: (rate) => _RateCardSummary(
              rate: rate,
              purity: _purity,
              onHistory: showHistory ? () => context.push('/rates/history') : null,
            ),
          ),
          const SizedBox(height: 20),
          Text('Purity', style: Theme.of(context).textTheme.titleSmall),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            children: [
              for (final p in ['24k', '22k', '18k', 'silver'])
                ChoiceChip(
                  label: Text(p == 'silver' ? 'Silver' : p.toUpperCase()),
                  selected: _purity == p,
                  onSelected: (_) => setState(() => _purity = p),
                ),
            ],
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _weightCtrl,
            decoration: const InputDecoration(
              labelText: 'Weight (grams)',
              border: OutlineInputBorder(),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [
              FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
            ],
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _makingCtrl,
            decoration: InputDecoration(
              labelText: ref.watch(publicConfigProvider).valueOrNull
                          ?.makingChargeDefault.type ==
                      'flat'
                  ? 'Making (₹ flat)'
                  : 'Making (%)',
              border: const OutlineInputBorder(),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _gstCtrl,
            decoration: const InputDecoration(
              labelText: 'GST (%)',
              border: OutlineInputBorder(),
            ),
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: AppPrimaryButton(
                  label: 'Calculate',
                  loading: _loading,
                  onPressed: _calculate,
                ),
              ),
              const SizedBox(width: 8),
              AppSecondaryButton(label: 'Reset', onPressed: _reset),
            ],
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(
              _error.toString(),
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ],
          if (_quote != null) ...[
            const SizedBox(height: 20),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: tokens?.border ?? Theme.of(context).dividerColor),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Breakup', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 8),
                  _line(context, 'Rate / g', formatInr(_quote!.ratePerGram, precise: true)),
                  _line(context, 'Metal', formatInr(_quote!.breakup.metalValue, precise: true)),
                  _line(context, 'Making', formatInr(_quote!.breakup.making, precise: true)),
                  _line(context, 'GST', formatInr(_quote!.breakup.gst, precise: true)),
                  const Divider(),
                  _line(
                    context,
                    'Total',
                    formatInr(_quote!.breakup.total, precise: true),
                    bold: true,
                  ),
                ],
              ),
            ),
            if (features?.whatsapp == true) ...[
              const SizedBox(height: 12),
              AppSecondaryButton(
                label: 'Share on WhatsApp',
                onPressed: _shareWhatsApp,
              ),
            ],
          ],
        ],
      ),
    );
  }

  Widget _line(BuildContext context, String label, String value, {bool bold = false}) {
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

class _RateCardSummary extends StatelessWidget {
  const _RateCardSummary({
    required this.rate,
    required this.purity,
    this.onHistory,
  });

  final RateSnapshot? rate;
  final String purity;
  final VoidCallback? onHistory;

  @override
  Widget build(BuildContext context) {
    if (rate == null) {
      return const AppEmptyState(
        title: 'No rates published',
        message: 'Ask the shop to set today’s gold & silver rates.',
      );
    }
    final perGram = ratePerGramForPurity(rate!, purity);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
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
          Row(
            children: [
              Text('Today’s rate', style: Theme.of(context).textTheme.titleMedium),
              const Spacer(),
              if (rate!.isLive)
                Text(
                  'Live',
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.w700,
                      ),
                ),
              if (onHistory != null)
                TextButton(onPressed: onHistory, child: const Text('History')),
            ],
          ),
          Text(
            '${purity == 'silver' ? 'Silver' : purity.toUpperCase()} · ${formatInr(perGram, precise: true)} / g',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          Text(
            'Updated ${formatRateTime(rate!.effectiveAt)}',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}
