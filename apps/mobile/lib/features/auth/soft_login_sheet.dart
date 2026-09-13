import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

Future<void> showSoftLoginSheet(
  BuildContext context, {
  required String returnTo,
  String message = 'Login to save items to your wishlist.',
}) {
  return showModalBottomSheet<void>(
    context: context,
    showDragHandle: true,
    builder: (context) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(24, 8, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Login to continue',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(message),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () {
                Navigator.of(context).pop();
                context.push('/auth/phone?returnTo=${Uri.encodeComponent(returnTo)}');
              },
              child: const Text('Continue with phone'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Not now'),
            ),
          ],
        ),
      );
    },
  );
}
