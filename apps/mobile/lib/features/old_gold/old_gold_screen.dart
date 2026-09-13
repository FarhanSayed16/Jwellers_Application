import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/providers.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../shared/format.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../auth/soft_login_sheet.dart';

class OldGoldScreen extends ConsumerStatefulWidget {
  const OldGoldScreen({super.key});

  @override
  ConsumerState<OldGoldScreen> createState() => _OldGoldScreenState();
}

class _OldGoldScreenState extends ConsumerState<OldGoldScreen> {
  String _metal = 'gold';
  String _purity = '22K';
  final _weightCtrl = TextEditingController(text: '10');
  Map<String, dynamic>? _quote;
  String? _error;
  bool _loading = false;
  double? _deduction;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadConfig());
  }

  @override
  void dispose() {
    _weightCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadConfig() async {
    try {
      final api = ref.read(apiClientProvider);
      final data = await api.getData<Map<String, dynamic>>(
        '/old-gold/config',
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      if (!mounted) return;
      setState(() => _deduction = (data['exchangeDeductionPercent'] as num?)?.toDouble());
    } catch (_) {
      /* optional */
    }
  }

  Future<void> _fetchQuote({bool save = false}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (save && !ref.read(authProvider.notifier).isLoggedIn) {
        await showSoftLoginSheet(
          context,
          returnTo: '/old-gold',
          message: 'Login to save exchange estimates to your history.',
        );
        if (!ref.read(authProvider.notifier).isLoggedIn) {
          setState(() => _loading = false);
          return;
        }
      }
      final api = ref.read(apiClientProvider);
      final weight = double.tryParse(_weightCtrl.text.trim()) ?? 0;
      final data = await api.postData<Map<String, dynamic>>(
        '/old-gold/quote',
        body: {
          'metal': _metal,
          'purity': _purity,
          'weightGrams': weight,
          'save': save,
        },
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      if (!mounted) return;
      setState(() {
        _quote = Map<String, dynamic>.from(data['quote'] as Map? ?? {});
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Could not estimate exchange value';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final flags = ref.watch(featuresProvider).valueOrNull;
    if (flags != null && !flags.oldGoldExchange) {
      return Scaffold(
        appBar: AppBar(title: const Text('Old-gold exchange')),
        body: const AppEmptyState(
          title: 'Not available',
          message: 'Old-gold exchange is not enabled for this shop.',
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Old-gold exchange')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (_deduction != null)
            Text(
              'Shop deduction: ${_deduction!.toStringAsFixed(1)}%',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _metal,
            decoration: const InputDecoration(labelText: 'Metal'),
            items: const [
              DropdownMenuItem(value: 'gold', child: Text('Gold')),
              DropdownMenuItem(value: 'silver', child: Text('Silver')),
            ],
            onChanged: (v) => setState(() => _metal = v ?? 'gold'),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _purity,
            decoration: const InputDecoration(labelText: 'Purity'),
            items: const [
              DropdownMenuItem(value: '24K', child: Text('24K')),
              DropdownMenuItem(value: '22K', child: Text('22K')),
              DropdownMenuItem(value: '18K', child: Text('18K')),
              DropdownMenuItem(value: 'other', child: Text('Other / silver')),
            ],
            onChanged: (v) => setState(() => _purity = v ?? '22K'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _weightCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
            decoration: const InputDecoration(labelText: 'Weight (grams)'),
          ),
          const SizedBox(height: 16),
          AppPrimaryButton(
            label: _loading ? 'Estimating…' : 'Estimate value',
            onPressed: _loading ? null : () => _fetchQuote(),
          ),
          const SizedBox(height: 8),
          AppSecondaryButton(
            label: 'Save to my history',
            onPressed: _loading ? null : () => _fetchQuote(save: true),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          if (_quote != null) ...[
            const SizedBox(height: 24),
            Text('Gross: ${formatInr((_quote!['grossValue'] as num?)?.toDouble() ?? 0)}'),
            Text(
              'Estimated after deduction: ${formatInr((_quote!['estimatedValue'] as num?)?.toDouble() ?? 0)}',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            Text(
              'Rate used: ₹${(_quote!['ratePerGram'] as num?)?.toStringAsFixed(2) ?? '—'} /g',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          ],
        ],
      ),
    );
  }
}
