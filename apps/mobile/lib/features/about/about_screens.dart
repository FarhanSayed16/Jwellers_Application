import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/providers.dart';
import '../../core/flavor/flavor_config.dart';
import '../../shared/widgets/app_skeleton.dart';
import '../../shared/widgets/cached_image.dart';
import '../../shared/widgets/empty_error.dart';
import '../../shared/widgets/trust_strip.dart';

class AboutScreen extends ConsumerWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(publicConfigProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('About')),
      body: async.when(
        loading: () => const Padding(
          padding: EdgeInsets.all(16),
          child: AppSkeleton(height: 160, borderRadius: 12),
        ),
        error: (e, _) => AppErrorRetry(
          message: e.toString(),
          onRetry: () => ref.read(publicConfigProvider.notifier).reload(),
        ),
        data: (config) {
          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              if (config.logoUrl.isNotEmpty)
                Center(
                  child: AppCachedImage(
                    url: config.logoUrl,
                    width: 96,
                    height: 96,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              const SizedBox(height: 16),
              Text(
                config.shopName,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 16),
              const Center(child: TrustStrip()),
              const SizedBox(height: 24),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.call_outlined),
                title: Text(config.contactPhone),
                onTap: () async {
                  final uri = Uri(scheme: 'tel', path: config.contactPhone);
                  if (await canLaunchUrl(uri)) await launchUrl(uri);
                },
              ),
              if ((config.socialWhatsapp ?? '').isNotEmpty)
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.chat_outlined),
                  title: const Text('WhatsApp'),
                  onTap: () async {
                    final digits =
                        config.socialWhatsapp!.replaceAll(RegExp(r'\D'), '');
                    final uri = Uri.parse('https://wa.me/$digits');
                    if (await canLaunchUrl(uri)) {
                      await launchUrl(uri, mode: LaunchMode.externalApplication);
                    }
                  },
                ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.privacy_tip_outlined),
                title: const Text('Privacy policy'),
                onTap: () => context.push('/legal/privacy'),
              ),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.description_outlined),
                title: const Text('Terms of use'),
                onTap: () => context.push('/legal/terms'),
              ),
              Text(
                'Client: ${config.clientSlug.isEmpty ? FlavorConfig.instance.slug : config.clientSlug}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          );
        },
      ),
    );
  }
}
