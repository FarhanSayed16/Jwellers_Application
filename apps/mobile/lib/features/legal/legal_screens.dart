import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/providers.dart';
import '../../core/flavor/flavor_config.dart';

Future<void> _openUrl(String? url) async {
  if (url == null || url.isEmpty) return;
  final uri = Uri.tryParse(url);
  if (uri == null) return;
  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  }
}

class PrivacyScreen extends ConsumerWidget {
  const PrivacyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(publicConfigProvider).valueOrNull;
    final shop = config?.shopName ?? FlavorConfig.instance.appName;
    final hosted = config?.privacyPolicyUrl;

    return Scaffold(
      appBar: AppBar(title: const Text('Privacy')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(
            '$shop uses your phone number to verify your account, save wishlist '
            'items, process enquiries/chat, and (if you allow) send push notifications. '
            'Images you attach may be stored with our image host. '
            'Account deletion anonymizes your phone, revokes sessions, and clears wishlist.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 16),
          Text(
            'Hallmark / HUID details are shown as provided by the retailer — confirm on BIS Care.',
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 24),
          if (hosted != null && hosted.isNotEmpty)
            FilledButton.tonal(
              onPressed: () => _openUrl(hosted),
              child: const Text('Open full privacy policy'),
            )
          else
            Text(
              'Hosted policy URL will appear when LEGAL_PRIVACY_URL is configured on the API.',
              style: Theme.of(context).textTheme.bodySmall,
            ),
          TextButton(
            onPressed: () => Navigator.of(context).maybePop(),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

class TermsScreen extends ConsumerWidget {
  const TermsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(publicConfigProvider).valueOrNull;
    final shop = config?.shopName ?? FlavorConfig.instance.appName;
    final hosted = config?.termsOfUseUrl;

    return Scaffold(
      appBar: AppBar(title: const Text('Terms of use')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Text(
            '$shop provides a catalogue and enquiry channel. Rates and quotes are '
            'indicative unless an invoice is issued. Stock is not guaranteed.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          const SizedBox(height: 24),
          if (hosted != null && hosted.isNotEmpty)
            FilledButton.tonal(
              onPressed: () => _openUrl(hosted),
              child: const Text('Open full terms'),
            ),
        ],
      ),
    );
  }
}
