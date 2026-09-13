import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/push/push_service.dart';
import '../../shared/widgets/app_buttons.dart';

/// One-time permission priming after splash (can skip).
class NotificationPrimeScreen extends ConsumerStatefulWidget {
  const NotificationPrimeScreen({super.key});

  @override
  ConsumerState<NotificationPrimeScreen> createState() =>
      _NotificationPrimeScreenState();
}

class _NotificationPrimeScreenState
    extends ConsumerState<NotificationPrimeScreen> {
  bool _busy = false;

  Future<void> _finish({required bool request}) async {
    setState(() => _busy = true);
    final push = ref.read(pushServiceProvider);
    try {
      await push.init();
      if (request) {
        await push.requestPermission();
        await push.registerWithApiIfLoggedIn();
      } else {
        await push.markPrimed();
      }
    } finally {
      if (mounted) context.go('/home');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              Icon(Icons.notifications_active_outlined,
                  size: 64, color: theme.colorScheme.primary),
              const SizedBox(height: 24),
              Text(
                'Stay updated',
                textAlign: TextAlign.center,
                style: theme.textTheme.headlineSmall?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Get a quiet nudge when today’s rates change, staff replies in chat, or a new piece arrives.',
                textAlign: TextAlign.center,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
              ),
              const Spacer(),
              AppPrimaryButton(
                label: 'Enable notifications',
                loading: _busy,
                onPressed: _busy ? null : () => _finish(request: true),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: _busy ? null : () => _finish(request: false),
                child: const Text('Not now'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
