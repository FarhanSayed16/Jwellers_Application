import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/providers.dart';
import '../../core/flavor/flavor_config.dart';
import '../../core/network/api_client.dart';
import '../auth/auth_provider.dart';
import '../auth/soft_login_sheet.dart';
import '../wishlist/wishlist_provider.dart';

class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final config = ref.watch(publicConfigProvider).valueOrNull;
    final features = ref.watch(featuresProvider).valueOrNull;
    final customer = ref.watch(authProvider).valueOrNull;
    final shop = config?.shopName ?? FlavorConfig.instance.appName;

    return Scaffold(
      appBar: AppBar(title: const Text('Account')),
      body: ListView(
        children: [
          ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person_outline)),
            title: Text(
              customer == null
                  ? shop
                  : (customer.name.isNotEmpty ? customer.name : 'Customer'),
            ),
            subtitle: Text(customer == null ? 'Guest' : customer.phone),
            trailing: customer == null
                ? TextButton(
                    onPressed: () =>
                        context.push('/auth/phone?returnTo=/account'),
                    child: const Text('Login'),
                  )
                : null,
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.favorite_outline),
            title: const Text('My wishlist'),
            onTap: () {
              if (customer == null) {
                showSoftLoginSheet(context, returnTo: '/wishlist');
              } else {
                context.push('/wishlist');
              }
            },
          ),
          ListTile(
            leading: const Icon(Icons.mail_outline),
            title: const Text('My enquiries'),
            onTap: () {
              if (customer == null) {
                showSoftLoginSheet(context, returnTo: '/enquiries');
              } else {
                context.push('/enquiries');
              }
            },
          ),
          if (features?.customRequests == true)
            ListTile(
              leading: const Icon(Icons.design_services_outlined),
              title: const Text('Custom requests'),
              onTap: () {
                if (customer == null) {
                  showSoftLoginSheet(context, returnTo: '/custom-requests');
                } else {
                  context.push('/custom-requests');
                }
              },
            ),
          if (features?.offers == true)
            ListTile(
              leading: const Icon(Icons.local_offer_outlined),
              title: const Text('Offers'),
              onTap: () => context.push('/offers'),
            ),
          if (features?.oldGoldExchange == true)
            ListTile(
              leading: const Icon(Icons.scale_outlined),
              title: const Text('Old-gold exchange'),
              onTap: () => context.push('/old-gold'),
            ),
          if (features?.razorpayPayments == true)
            ListTile(
              leading: const Icon(Icons.payments_outlined),
              title: const Text('Pay advance'),
              onTap: () {
                if (customer == null) {
                  showSoftLoginSheet(context, returnTo: '/pay-advance');
                } else {
                  context.push('/pay-advance');
                }
              },
            ),
          if (features?.appointments == true)
            ListTile(
              leading: const Icon(Icons.event_available_outlined),
              title: const Text('Book a store visit'),
              onTap: () => context.push('/appointments/book'),
            ),
          if (features?.storeMode == true)
            ListTile(
              leading: const Icon(Icons.tablet_mac_outlined),
              title: const Text('Store mode'),
              onTap: () => context.push('/store-mode'),
            ),
          if (features?.referrals == true)
            ListTile(
              leading: const Icon(Icons.group_add_outlined),
              title: const Text('Referrals'),
              onTap: () {
                if (customer == null) {
                  showSoftLoginSheet(context, returnTo: '/referrals');
                } else {
                  context.push('/referrals');
                }
              },
            ),
          if (features?.digitalBilling == true)
            ListTile(
              leading: const Icon(Icons.receipt_long_outlined),
              title: const Text('Invoices'),
              onTap: () {
                if (customer == null) {
                  showSoftLoginSheet(context, returnTo: '/invoices');
                } else {
                  context.push('/invoices');
                }
              },
            ),
          if (features?.priceAlerts == true)
            ListTile(
              leading: const Icon(Icons.notifications_active_outlined),
              title: const Text('Price alerts'),
              onTap: () {
                if (customer == null) {
                  showSoftLoginSheet(context, returnTo: '/price-alerts');
                } else {
                  context.push('/price-alerts');
                }
              },
            ),
          if (features?.whatsappBusinessApi == true && customer != null)
            const _WhatsappMarketingOptInTile(),
          if (features?.rateHistory != false)
            ListTile(
              leading: const Icon(Icons.show_chart),
              title: const Text('Rate history'),
              onTap: () => context.push('/rates/history'),
            ),
          if (features?.sizeGuide != false)
            ListTile(
              leading: const Icon(Icons.straighten),
              title: const Text('Size guide'),
              onTap: () => context.push('/size-guide'),
            ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: const Text('About retailer'),
            onTap: () => context.push('/about'),
          ),
          ListTile(
            leading: const Icon(Icons.brightness_6_outlined),
            title: const Text('Theme'),
            onTap: () => context.push('/settings/theme'),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: const Text('Privacy'),
            onTap: () => context.push('/legal/privacy'),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: const Text('Terms of use'),
            onTap: () => context.push('/legal/terms'),
          ),
          ListTile(
            leading: const Icon(Icons.support_agent_outlined),
            title: const Text('Support'),
            onTap: () async {
              final config = ref.read(publicConfigProvider).valueOrNull;
              final email = config?.supportEmail?.trim();
              final phone = config?.contactPhone.trim();
              if (email != null && email.isNotEmpty) {
                final uri = Uri(scheme: 'mailto', path: email);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri);
                  return;
                }
              }
              if (phone != null && phone.isNotEmpty) {
                final uri = Uri(scheme: 'tel', path: phone);
                if (await canLaunchUrl(uri)) {
                  await launchUrl(uri);
                  return;
                }
              }
              if (context.mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Support contact is not configured yet.'),
                  ),
                );
              }
            },
          ),
          if (customer != null) ...[
            ListTile(
              leading: const Icon(Icons.delete_outline),
              title: const Text('Delete account'),
              onTap: () => context.push('/account/delete'),
            ),
            ListTile(
              leading: const Icon(Icons.logout),
              title: const Text('Log out'),
              onTap: () async {
                await ref.read(authProvider.notifier).logout();
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Logged out')),
                  );
                }
              },
            ),
          ],
        ],
      ),
    );
  }
}

class DeleteAccountScreen extends ConsumerStatefulWidget {
  const DeleteAccountScreen({super.key});

  @override
  ConsumerState<DeleteAccountScreen> createState() =>
      _DeleteAccountScreenState();
}

class _DeleteAccountScreenState extends ConsumerState<DeleteAccountScreen> {
  final _ctrl = TextEditingController();
  bool _loading = false;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _delete() async {
    if (_ctrl.text.trim().toUpperCase() != 'DELETE') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Type DELETE to confirm')),
      );
      return;
    }
    setState(() => _loading = true);
    try {
      await ref.read(apiClientProvider).deleteData(
            '/auth/customer/me',
            body: {'confirm': 'DELETE'},
            parse: (_) => null,
          );
      await ref.read(tokenStoreProvider).clear();
      await ref.read(authProvider.notifier).reload();
      await ref.read(wishlistIdsProvider.notifier).reload();
      if (!mounted) return;
      context.go('/home');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Account deleted. You can sign in again later with the same phone.'),
        ),
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Delete account')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'This permanently deletes your login for this shop app:\n'
              '• Anonymizes your phone number\n'
              '• Signs you out on all devices\n'
              '• Turns off push notifications for this account\n'
              '• Clears your wishlist\n\n'
              'Enquiry/chat history may be kept by the shop for business records. '
              'Type DELETE to confirm.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _ctrl,
              decoration: const InputDecoration(
                labelText: 'Type DELETE',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _loading ? null : _delete,
              child: _loading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('Delete my account'),
            ),
          ],
        ),
      ),
    );
  }
}

class _WhatsappMarketingOptInTile extends ConsumerStatefulWidget {
  const _WhatsappMarketingOptInTile();

  @override
  ConsumerState<_WhatsappMarketingOptInTile> createState() =>
      _WhatsappMarketingOptInTileState();
}

class _WhatsappMarketingOptInTileState
    extends ConsumerState<_WhatsappMarketingOptInTile> {
  bool? _optIn;
  bool _loading = true;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final data = await ref.read(apiClientProvider).getData<Map<String, dynamic>>(
            '/me/whatsapp-marketing-opt-in',
            parse: (json) => Map<String, dynamic>.from(json as Map),
          );
      if (!mounted) return;
      setState(() {
        _optIn = data['whatsappMarketingOptIn'] == true;
        _loading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _optIn = false;
        _loading = false;
      });
    }
  }

  Future<void> _set(bool value) async {
    setState(() => _saving = true);
    try {
      final data = await ref.read(apiClientProvider).putData<Map<String, dynamic>>(
            '/me/whatsapp-marketing-opt-in',
            body: {'optIn': value},
            parse: (json) => Map<String, dynamic>.from(json as Map),
          );
      if (!mounted) return;
      setState(() {
        _optIn = data['whatsappMarketingOptIn'] == true;
        _saving = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      secondary: const Icon(Icons.chat_outlined),
      title: const Text('WhatsApp offers & rates'),
      subtitle: const Text('Allow the shop to message you on WhatsApp'),
      value: _optIn ?? false,
      onChanged: (_loading || _saving || _optIn == null) ? null : _set,
    );
  }
}
