import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/network/api_exception.dart';
import '../../shared/widgets/app_buttons.dart';
import 'auth_provider.dart';

class OtpAuthScreen extends ConsumerStatefulWidget {
  const OtpAuthScreen({
    super.key,
    required this.phone,
    this.returnTo,
    this.cooldownSeconds = 30,
    this.devOtp,
  });

  final String phone;
  final String? returnTo;
  final int cooldownSeconds;
  final String? devOtp;

  @override
  ConsumerState<OtpAuthScreen> createState() => _OtpAuthScreenState();
}

class _OtpAuthScreenState extends ConsumerState<OtpAuthScreen> {
  final _ctrl = TextEditingController();
  String? _error;
  bool _loading = false;
  late int _cooldown;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _cooldown = widget.cooldownSeconds;
    _startCooldown();
    if (widget.devOtp != null) {
      _ctrl.text = widget.devOtp!;
    }
  }

  void _startCooldown() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_cooldown <= 1) {
        t.cancel();
        setState(() => _cooldown = 0);
      } else {
        setState(() => _cooldown -= 1);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _verify() async {
    final otp = _ctrl.text.trim();
    if (!RegExp(r'^\d{6}$').hasMatch(otp)) {
      setState(() => _error = 'Enter the 6-digit OTP.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authProvider.notifier).verifyOtp(
            phone: widget.phone,
            otp: otp,
          );
      if (!mounted) return;
      final target = widget.returnTo;
      if (target != null && target.isNotEmpty) {
        context.go(target);
      } else {
        context.go('/home');
      }
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _resend() async {
    if (_cooldown > 0) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result =
          await ref.read(authProvider.notifier).requestOtp(widget.phone);
      if (!mounted) return;
      setState(() {
        _cooldown = result.cooldownSeconds;
        if (result.devOtp != null) _ctrl.text = result.devOtp!;
      });
      _startCooldown();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP sent again')),
      );
    } on ApiException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enter OTP')),
      body: AutofillGroup(
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            Text(
              'Code sent to ${widget.phone}',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            if (widget.devOtp != null) ...[
              const SizedBox(height: 8),
              Text(
                'Dev OTP prefilled (non-prod).',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
            const SizedBox(height: 24),
            TextField(
              controller: _ctrl,
              autofocus: true,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.done,
              onSubmitted: (_) => _verify(),
              autofillHints: const [AutofillHints.oneTimeCode],
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(6),
              ],
              decoration: const InputDecoration(
                labelText: '6-digit OTP',
                border: OutlineInputBorder(),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(
                _error!,
                style: TextStyle(color: Theme.of(context).colorScheme.error),
              ),
            ],
            const SizedBox(height: 20),
            AppPrimaryButton(
              label: 'Verify',
              loading: _loading,
              onPressed: _verify,
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: _cooldown > 0 || _loading ? null : _resend,
              child: Text(
                _cooldown > 0 ? 'Resend in ${_cooldown}s' : 'Resend OTP',
              ),
            ),
          ],
        ),
      ),
    );
  }
}
