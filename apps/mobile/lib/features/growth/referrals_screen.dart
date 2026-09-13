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

class ReferralsScreen extends ConsumerStatefulWidget {
  const ReferralsScreen({super.key});

  @override
  ConsumerState<ReferralsScreen> createState() => _ReferralsScreenState();
}

class _ReferralsScreenState extends ConsumerState<ReferralsScreen> {
  String? _code;
  final _applyCtrl = TextEditingController();
  String? _msg;
  String? _error;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _load());
  }

  @override
  void dispose() {
    _applyCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    if (!ref.read(authProvider.notifier).isLoggedIn) return;
    try {
      final api = ref.read(apiClientProvider);
      final data = await api.getData<Map<String, dynamic>>(
        '/referrals/me',
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      if (!mounted) return;
      setState(() => _code = data['referralCode']?.toString());
    } catch (e) {
      if (!mounted) return;
      setState(() => _error = e is ApiException ? e.message : 'Could not load code');
    }
  }

  Future<void> _apply() async {
    setState(() {
      _loading = true;
      _error = null;
      _msg = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final data = await api.postData<Map<String, dynamic>>(
        '/referrals/apply',
        body: {'code': _applyCtrl.text.trim()},
        parse: (json) => Map<String, dynamic>.from(json as Map),
      );
      if (!mounted) return;
      setState(() {
        _loading = false;
        _msg = data['applied'] == true ? 'Referral applied. Thank you!' : 'Already referred or not applied.';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = e is ApiException ? e.message : 'Apply failed';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final flags = ref.watch(featuresProvider).valueOrNull;
    if (flags != null && !flags.referrals) {
      return Scaffold(
        appBar: AppBar(title: const Text('Referrals')),
        body: const AppEmptyState(title: 'Not available', message: 'Referrals are not enabled.'),
      );
    }

    if (!ref.watch(authProvider.notifier).isLoggedIn) {
      return Scaffold(
        appBar: AppBar(title: const Text('Referrals')),
        body: AppEmptyState(
          title: 'Login required',
          message: 'Sign in to get your referral code.',
          actionLabel: 'Login',
          onAction: () => showSoftLoginSheet(context, returnTo: '/referrals'),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Referrals')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text('Your code', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(child: Text(_code ?? '…', style: Theme.of(context).textTheme.headlineSmall)),
              if (_code != null)
                IconButton(
                  onPressed: () => Clipboard.setData(ClipboardData(text: _code!)),
                  icon: const Icon(Icons.copy),
                ),
            ],
          ),
          const SizedBox(height: 24),
          Text(
            'Tracking only — the shop grants any referral reward manually (no automatic credits).',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 24),
          Text('Have a friend’s code?', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          TextField(
            controller: _applyCtrl,
            decoration: const InputDecoration(labelText: 'Referral code', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 12),
          AppPrimaryButton(label: _loading ? 'Applying…' : 'Apply code', onPressed: _loading ? null : _apply),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
          ],
          if (_msg != null) ...[
            const SizedBox(height: 12),
            Text(_msg!),
          ],
        ],
      ),
    );
  }
}
