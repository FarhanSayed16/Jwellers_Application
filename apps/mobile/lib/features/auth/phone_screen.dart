import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_exception.dart';
import '../../shared/widgets/app_buttons.dart';
import 'auth_provider.dart';
import 'models.dart';
import 'otp_route_extra.dart';

class PhoneAuthScreen extends ConsumerStatefulWidget {
  const PhoneAuthScreen({super.key, this.returnTo});

  final String? returnTo;

  @override
  ConsumerState<PhoneAuthScreen> createState() => _PhoneAuthScreenState();
}

class _PhoneAuthScreenState extends ConsumerState<PhoneAuthScreen> {
  final _ctrl = TextEditingController();
  String? _error;
  bool _loading = false;
  int? _retryAfter;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final normalized = normalizeIndiaPhone(_ctrl.text);
    if (!isValidIndiaMobile(normalized)) {
      setState(() => _error = 'Enter a valid 10-digit Indian mobile number.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
      _retryAfter = null;
    });

    try {
      final result = await ref.read(authProvider.notifier).requestOtp(normalized);
      if (!mounted) return;
      context.push(
        '/auth/otp',
        extra: OtpRouteExtra(
          phone: normalized,
          returnTo: widget.returnTo,
          cooldownSeconds: result.cooldownSeconds,
          devOtp: result.devOtp,
        ),
      );
    } on ApiException catch (e) {
      setState(() {
        _error = e.message;
        if (e.code == 'OTP_RATE_LIMITED' || e.code == 'OTP_COOLDOWN') {
          final details = e.details;
          if (details is Map && details['retryAfterSeconds'] != null) {
            _retryAfter = int.tryParse(details['retryAfterSeconds'].toString());
          }
        }
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(
            'Enter your mobile number',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          const SizedBox(height: 8),
          Text(
            'We’ll send a one-time password to verify you.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          TextField(
            controller: _ctrl,
            autofocus: true,
            keyboardType: TextInputType.phone,
            textInputAction: TextInputAction.done,
            onSubmitted: (_) => _submit(),
            inputFormatters: [
              FilteringTextInputFormatter.digitsOnly,
              LengthLimitingTextInputFormatter(10),
            ],
            decoration: const InputDecoration(
              labelText: 'Mobile number',
              prefixText: '+91 ',
              border: OutlineInputBorder(),
              helperText: '10-digit Indian mobile',
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(
              _retryAfter != null
                  ? '$_error Try again in ${_retryAfter}s.'
                  : _error!,
              style: TextStyle(color: Theme.of(context).colorScheme.error),
            ),
          ],
          const SizedBox(height: 20),
          AppPrimaryButton(
            label: 'Send OTP',
            loading: _loading,
            onPressed: _submit,
          ),
          const SizedBox(height: 16),
          Text(
            'By continuing you agree to our privacy policy and terms of use.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          Wrap(
            spacing: 8,
            children: [
              TextButton(
                onPressed: () => context.push('/legal/privacy'),
                child: const Text('Privacy'),
              ),
              TextButton(
                onPressed: () => context.push('/legal/terms'),
                child: const Text('Terms'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
