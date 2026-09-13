import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/config/providers.dart';
import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../shared/widgets/app_buttons.dart';
import '../../shared/widgets/empty_error.dart';
import '../auth/auth_provider.dart';
import '../auth/soft_login_sheet.dart';

class PriceAlertsScreen extends ConsumerStatefulWidget {
  const PriceAlertsScreen({super.key});

  @override
  ConsumerState<PriceAlertsScreen> createState() => _PriceAlertsScreenState();
}

class _PriceAlertsScreenState extends ConsumerState<PriceAlertsScreen> {
  String _purity = '22K';
  final _amountCtrl = TextEditingController(text: '6500');
  List<Map<String, dynamic>> _alerts = [];
  String? _error;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _amountCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!ref.read(authProvider.notifier).isLoggedIn) return;
    try {
      final api = ref.read(apiClientProvider);
      final data = await api.getData<Map<String, dynamic>>(
        '/price-alerts/me',
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      if (!mounted) return;
      setState(() {
        _alerts = (data['alerts'] as List? ?? [])
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e is ApiException ? e.message : 'Could not load alerts');
    }
  }

  Future<void> _create() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      await api.postData(
        '/price-alerts',
        body: {
          'purity': _purity,
          'belowAmount': double.tryParse(_amountCtrl.text.trim()) ?? 0,
        },
      );
      await _load();
      if (!mounted) return;
      setState(() => _loading = false);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Create failed';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final flags = ref.watch(featuresProvider).valueOrNull;
    if (flags != null && !flags.priceAlerts) {
      return Scaffold(
        appBar: AppBar(title: const Text('Price alerts')),
        body: const AppEmptyState(title: 'Not available', message: 'Price alerts are not enabled.'),
      );
    }

    if (!ref.watch(authProvider.notifier).isLoggedIn) {
      return Scaffold(
        appBar: AppBar(title: const Text('Price alerts')),
        body: AppEmptyState(
          title: 'Login required',
          message: 'Sign in to set a rate alert.',
          actionLabel: 'Login',
          onAction: () => showSoftLoginSheet(context, returnTo: '/price-alerts'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Price alerts')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField<String>(
            initialValue: _purity,
            decoration: const InputDecoration(labelText: 'Purity', border: OutlineInputBorder()),
            items: const [
              DropdownMenuItem(value: '24K', child: Text('24K')),
              DropdownMenuItem(value: '22K', child: Text('22K')),
              DropdownMenuItem(value: '18K', child: Text('18K')),
              DropdownMenuItem(value: 'silver', child: Text('Silver')),
            ],
            onChanged: (v) => setState(() => _purity = v ?? '22K'),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _amountCtrl,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            inputFormatters: [FilteringTextInputFormatter.allow(RegExp(r'[0-9.]'))],
            decoration: const InputDecoration(
              labelText: 'Alert when rate ≤ ₹ / g',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          AppPrimaryButton(
            label: _loading ? 'Saving…' : 'Create alert',
            onPressed: _loading ? null : _create,
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          const SizedBox(height: 24),
          Text('Your alerts', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          for (final a in _alerts)
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: Text('${a['purity']} ≤ ₹${a['belowAmount']}'),
              subtitle: Text('${a['status']}'),
            ),
          if (_alerts.isEmpty)
            const Text('No alerts yet.', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
